const CARD_SELECTOR =
  "[data-github-repo]:not([data-github-demo-loaded]), [data-gh-repo]:not([data-github-demo-loaded])";

function setFallback(root: HTMLElement, selectors: string[], value: string): void {
  for (const selector of selectors) {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) continue;
    const current = element.textContent?.trim() ?? "";
    if (!current || /^(loading|chargement)/i.test(current)) element.textContent = value;
  }
}

function initGithubCards(): void {
  const cards = document.querySelectorAll<HTMLAnchorElement>(CARD_SELECTOR);
  const french = document.documentElement.lang === "fr";

  for (const card of cards) {
    const repo = card.dataset.githubRepo ?? card.dataset.ghRepo;
    if (!repo) continue;

    card.setAttribute("data-github-demo-loaded", "");
    card.setAttribute("data-github-static", "");
    setFallback(
      card,
      ["[data-gc-description]", ".gh-desc", ".gc-description", ".gh-card-desc"],
      french
        ? `Aperçu statique du dépôt GitHub ${repo}.`
        : `Static preview of the ${repo} GitHub repository.`,
    );
    setFallback(
      card,
      ["[data-gc-stars]", "[data-github-stars]", ".gc-stars .gc-num", ".gc-stars .gc-stat-value", '[data-gh-stat="stars"] .gh-card-count'],
      "—",
    );
    setFallback(
      card,
      ["[data-gc-forks]", "[data-github-forks]", ".gc-forks .gc-num", ".gc-forks .gc-stat-value", '[data-gh-stat="forks"] .gh-card-count'],
      "—",
    );
    setFallback(
      card,
      ["[data-gc-language]", "[data-github-language]", ".gc-language-name", ".gh-lang-name", '[data-gh-stat="language"] .gh-card-count'],
      "GitHub",
    );

    const plainLanguage = card.querySelector<HTMLElement>(".gc-language:empty");
    if (plainLanguage) plainLanguage.textContent = "GitHub";
    card.classList.remove("is-loading", "fetch-waiting", "fetch-error", "is-error");
    card.classList.add("is-loaded");
  }
}

initGithubCards();
document.addEventListener("astro:page-load", initGithubCards);
