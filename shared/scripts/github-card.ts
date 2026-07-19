const CARD_SELECTOR =
  "[data-github-repo]:not([data-github-demo-loaded]), [data-gh-repo]:not([data-github-demo-loaded])";
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_PREFIX = "lisible:github-card:";
const requests = new Map<string, Promise<GithubRepository>>();

const DESCRIPTION_SELECTORS = [
  "[data-gc-description]",
  ".gh-desc",
  ".gc-description",
  ".gh-card-desc",
];
const STAR_SELECTORS = [
  "[data-gc-stars]",
  "[data-github-stars]",
  ".gc-stars .gc-num",
  ".gc-stars .gc-stat-value",
  '[data-gh-stat="stars"] .gh-card-count',
];
const FORK_SELECTORS = [
  "[data-gc-forks]",
  "[data-github-forks]",
  ".gc-forks .gc-num",
  ".gc-forks .gc-stat-value",
  '[data-gh-stat="forks"] .gh-card-count',
];
const LANGUAGE_SELECTORS = [
  "[data-gc-language]",
  "[data-github-language]",
  ".gc-language-name",
  ".gh-lang-name",
  '[data-gh-stat="language"] .gh-card-count',
  ".gc-language:empty",
];
const AVATAR_SELECTORS = [".gc-avatar", ".gh-card-avatar", ".gh-avatar"];

interface GithubRepository {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  owner: {
    avatar_url: string;
  };
}

interface CachedRepository {
  expiresAt: number;
  data: GithubRepository;
}

function isRepository(value: unknown): value is GithubRepository {
  if (!value || typeof value !== "object") return false;
  const repository = value as Partial<GithubRepository>;
  return (
    (typeof repository.description === "string" || repository.description === null) &&
    typeof repository.stargazers_count === "number" &&
    typeof repository.forks_count === "number" &&
    (typeof repository.language === "string" || repository.language === null) &&
    Boolean(repository.owner) &&
    typeof repository.owner?.avatar_url === "string"
  );
}

function queryFirst(root: HTMLElement, selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) return element;
  }
  return null;
}

function revealStat(element: HTMLElement | null): void {
  element?.closest(".gh-card-stat, .gh-card-lang")?.classList.add("is-filled");
  element?.closest(".gc-language")?.classList.add("gc-language--visible");
}

function setText(root: HTMLElement, selectors: string[], value: string): void {
  const element = queryFirst(root, selectors);
  if (!element) return;
  element.textContent = value;
  revealStat(element);
}

function setAvatar(root: HTMLElement, avatarUrl: string): void {
  if (!avatarUrl.startsWith("https://")) return;
  const avatar = queryFirst(root, AVATAR_SELECTORS);
  if (avatar) avatar.style.backgroundImage = `url(${JSON.stringify(avatarUrl)})`;
}

function readCache(repo: string): GithubRepository | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${repo.toLowerCase()}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as Partial<CachedRepository>;
    if (
      typeof cached.expiresAt !== "number" ||
      cached.expiresAt <= Date.now() ||
      !isRepository(cached.data)
    ) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${repo.toLowerCase()}`);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function writeCache(repo: string, data: GithubRepository): void {
  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${repo.toLowerCase()}`,
      JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, data }),
    );
  } catch {}
}

async function requestRepository(repo: string): Promise<GithubRepository> {
  const cached = readCache(repo);
  if (cached) return cached;

  const pending = requests.get(repo);
  if (pending) return pending;

  const request = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const endpoint = repo.split("/").map(encodeURIComponent).join("/");
      const response = await fetch(`https://api.github.com/repos/${endpoint}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      const data: unknown = await response.json();
      if (!isRepository(data)) throw new Error("Invalid GitHub repository response");
      writeCache(repo, data);
      return data;
    } finally {
      window.clearTimeout(timeout);
    }
  })();

  requests.set(repo, request);
  try {
    return await request;
  } finally {
    if (requests.get(repo) === request) requests.delete(repo);
  }
}

function finishCard(card: HTMLElement): void {
  card.classList.remove("is-loading", "fetch-waiting", "fetch-error", "is-error");
  card.classList.add("is-loaded");
  card.removeAttribute("aria-busy");
  card.removeAttribute("data-github-static");
}

function renderRepository(card: HTMLElement, data: GithubRepository): void {
  const locale = document.documentElement.lang === "fr" ? "fr-FR" : "en-US";
  const format = new Intl.NumberFormat(locale);
  setText(
    card,
    DESCRIPTION_SELECTORS,
    data.description ??
      (locale === "fr-FR" ? "Aucune description fournie." : "No description provided."),
  );
  setText(card, STAR_SELECTORS, format.format(data.stargazers_count));
  setText(card, FORK_SELECTORS, format.format(data.forks_count));
  setText(
    card,
    LANGUAGE_SELECTORS,
    data.language ?? (locale === "fr-FR" ? "Non précisé" : "Not specified"),
  );
  setAvatar(card, data.owner.avatar_url);
  card.removeAttribute("data-github-error");
  finishCard(card);
}

function renderFallback(card: HTMLElement): void {
  const french = document.documentElement.lang === "fr";
  setText(
    card,
    DESCRIPTION_SELECTORS,
    french
      ? "Les informations du dépôt sont temporairement indisponibles."
      : "Repository information is temporarily unavailable.",
  );
  setText(card, STAR_SELECTORS, "—");
  setText(card, FORK_SELECTORS, "—");
  setText(card, LANGUAGE_SELECTORS, "—");
  card.setAttribute("data-github-error", "");
  finishCard(card);
}

async function hydrateGithubCard(card: HTMLAnchorElement): Promise<void> {
  card.setAttribute("data-github-demo-loaded", "");
  const repo = (card.dataset.githubRepo ?? card.dataset.ghRepo)?.trim();
  if (!repo || !/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(repo)) {
    renderFallback(card);
    return;
  }

  card.setAttribute("aria-busy", "true");
  try {
    renderRepository(card, await requestRepository(repo));
  } catch {
    renderFallback(card);
  }
}

function initGithubCards(): void {
  document
    .querySelectorAll<HTMLAnchorElement>(CARD_SELECTOR)
    .forEach((card) => void hydrateGithubCard(card));
}

initGithubCards();
document.addEventListener("astro:page-load", initGithubCards);
