async function navigate(href: string): Promise<void> {
  const mod = await import("astro:transitions/client");
  await mod.navigate(href);
}

type PagefindResult = {
  data: () => Promise<{
    url: string;
    excerpt: string;
    meta: { title?: string };
  }>;
};
type PagefindModule = {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => void;
  debouncedSearch: (
    query: string,
  ) => Promise<{ results: PagefindResult[] } | null>;
};

let pagefind: PagefindModule | null = null;
let loadFailed = false;
let activeIndex = -1;
let searchToken = 0;

function palette(): HTMLDialogElement | null {
  return document.querySelector<HTMLDialogElement>("[data-command-palette]");
}
function input(): HTMLInputElement | null {
  return palette()?.querySelector<HTMLInputElement>("[data-cp-input]") ?? null;
}

function visibleItems(): HTMLElement[] {
  const root = palette();
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>("[data-cp-item]")].filter(
    (el) => {
      if (el.hidden) return false;
      const section = el.closest<HTMLElement>("[data-cp-section]");
      return !section || !section.hidden;
    },
  );
}

function setActive(index: number) {
  const items = visibleItems();
  const box = input();
  items.forEach((el) => el.setAttribute("aria-selected", "false"));
  if (items.length === 0) {
    activeIndex = -1;
    box?.removeAttribute("aria-activedescendant");
    return;
  }
  activeIndex = ((index % items.length) + items.length) % items.length;
  const el = items[activeIndex];
  if (!el) return;
  el.setAttribute("aria-selected", "true");
  if (el.id) box?.setAttribute("aria-activedescendant", el.id);
  el.scrollIntoView({ block: "nearest" });
}

function updateEmptyState() {
  const root = palette();
  if (!root) return;
  const empty = root.querySelector<HTMLElement>("[data-cp-empty]");
  if (empty) empty.hidden = visibleItems().length > 0;
}

function filterStatic(query: string) {
  const root = palette();
  if (!root) return;
  const normalized = query.trim().toLowerCase();
  for (const section of root.querySelectorAll<HTMLElement>(
    '[data-cp-section="actions"], [data-cp-section="nav"]',
  )) {
    let anyVisible = false;
    for (const item of section.querySelectorAll<HTMLElement>("[data-cp-item]")) {
      const label = (item.textContent ?? "").trim().toLowerCase();
      const match = normalized === "" || label.includes(normalized);
      item.hidden = !match;
      if (match) anyVisible = true;
    }
    const heading = section.querySelector<HTMLElement>("p");
    if (heading) heading.hidden = !anyVisible;
  }
}

async function ensurePagefind() {
  if (pagefind || loadFailed) return;
  try {
    const mod = (await import(
      /* @vite-ignore */ "/pagefind/pagefind.js"
    )) as PagefindModule;
    await mod.options({ excerptLength: 20 });
    mod.init();
    pagefind = mod;
  } catch {
    loadFailed = true;
  }
}

async function runSearch(query: string) {
  const root = palette();
  if (!root) return;
  const section = root.querySelector<HTMLElement>('[data-cp-section="results"]');
  const container = root.querySelector<HTMLElement>("[data-cp-results]");
  if (!section || !container) return;

  if (query.trim() === "") {
    section.hidden = true;
    container.innerHTML = "";
    return;
  }

  await ensurePagefind();
  if (loadFailed || !pagefind) {
    section.hidden = false;
    container.innerHTML = `<p class="px-3 py-2 text-xs text-muted-foreground">${root.dataset.devNotice ?? ""}</p>`;
    return;
  }

  const token = ++searchToken;
  const search = await pagefind.debouncedSearch(query);
  if (!search || token !== searchToken) return;
  const results = await Promise.all(
    search.results.slice(0, 6).map((r) => r.data()),
  );
  if (token !== searchToken) return;

  container.innerHTML = "";
  if (results.length === 0) {
    section.hidden = true;
  } else {
    section.hidden = false;
    results.forEach((result, i) => {
      const link = document.createElement("a");
      link.href = result.url;
      link.id = `cp-result-${i}`;
      link.setAttribute("role", "option");
      link.setAttribute("data-cp-item", "");
      link.setAttribute("data-cp-nav", "");
      link.setAttribute("aria-selected", "false");
      link.className =
        "flex flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-secondary aria-selected:bg-secondary aria-selected:text-foreground";
      const title = document.createElement("span");
      title.className = "text-sm font-semibold";
      title.textContent = result.meta.title ?? result.url;
      const excerpt = document.createElement("span");
      excerpt.className = "text-xs leading-relaxed text-muted-foreground";
      excerpt.innerHTML = result.excerpt;
      link.append(title, excerpt);
      container.appendChild(link);
    });
  }
  updateEmptyState();
  setActive(0);
}

function onInput() {
  const box = input();
  if (!box) return;
  const query = box.value;
  filterStatic(query);
  void runSearch(query);
  updateEmptyState();
  setActive(0);
}

function applyThemeToggle() {
  const next = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {
  }
  window.__applyAccent?.();
}

function resetAccent() {
  try {
    localStorage.removeItem("accent");
  } catch {
  }
  window.__applyAccent?.();
}

async function copyUrl() {
  const root = palette();
  try {
    await navigator.clipboard.writeText(window.location.href);
    const label = root?.querySelector<HTMLElement>("[data-cp-copy-label]");
    if (label && root) {
      const original = label.textContent;
      label.textContent = root.dataset.copied ?? "";
      window.setTimeout(() => {
        label.textContent = original;
      }, 1500);
    }
  } catch {
  }
}

function activate(item: HTMLElement) {
  const root = palette();
  if (item.dataset.cpNav !== undefined && item.tagName === "A") {
    root?.close();
    void navigate((item as HTMLAnchorElement).href);
    return;
  }
  switch (item.dataset.cpAction) {
    case "toggle-theme":
      applyThemeToggle();
      break;
    case "reset-accent":
      resetAccent();
      break;
    case "copy-url":
      void copyUrl();
      break;
    case "switch-lang": {
      const href = root?.dataset.switchLangHref;
      root?.close();
      if (href) void navigate(href);
      break;
    }
  }
}

function open() {
  const root = palette();
  if (!root || root.open) return;
  root.showModal();
  const box = input();
  if (box) {
    box.value = "";
    box.focus();
  }
  filterStatic("");
  void runSearch("");
  updateEmptyState();
  setActive(0);
  void ensurePagefind();
}

function bind() {
  const root = palette();
  if (!root || root.dataset.bound === "true") return;
  root.dataset.bound = "true";

  root.querySelector("[data-cp-input]")?.addEventListener("input", onInput);

  root.addEventListener("keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    if (key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
    } else if (key === "Enter") {
      const items = visibleItems();
      const el = items[activeIndex];
      if (el) {
        event.preventDefault();
        activate(el);
      }
    }
  });

  root.querySelector("[data-cp-list]")?.addEventListener("click", (event) => {
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-cp-item]",
    );
    if (!item) return;
    if (item.dataset.cpNav !== undefined && item.tagName === "A") return;
    event.preventDefault();
    activate(item);
  });
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-search-open]")) {
    open();
    return;
  }
  if (target?.closest("[data-search-close]")) {
    palette()?.close();
    return;
  }
  const root = palette();
  if (root?.open && event.target === root) root.close();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const root = palette();
    if (root?.open) root.close();
    else open();
  }
});

document.addEventListener("astro:page-load", bind);
document.addEventListener("astro:before-swap", () => palette()?.close());

bind();
