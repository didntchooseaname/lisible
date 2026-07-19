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

function getModal(): HTMLDialogElement | null {
  return document.querySelector<HTMLDialogElement>("[data-search-modal]");
}

function renderMessage(modal: HTMLDialogElement, message: string) {
  const container = modal.querySelector("[data-search-results]");
  if (!container) return;
  container.innerHTML = "";
  const p = document.createElement("p");
  p.className = "px-3 py-6 text-center text-sm text-muted-foreground";
  p.textContent = message;
  container.appendChild(p);
}

async function ensurePagefind(): Promise<void> {
  if (pagefind || loadFailed) return;
  try {
    const module = (await import(
      /* @vite-ignore */ "/pagefind/pagefind.js"
    )) as PagefindModule;
    await module.options({ excerptLength: 25 });
    module.init();
    pagefind = module;
  } catch {
    loadFailed = true;
  }
}

async function openSearch(): Promise<void> {
  const modal = getModal();
  if (!modal || modal.open) return;
  modal.showModal();
  modal.querySelector<HTMLInputElement>("[data-search-input]")?.focus();
  await ensurePagefind();
  if (loadFailed) {
    renderMessage(modal, modal.dataset.devNotice ?? "");
  }
}

async function runSearch(input: HTMLInputElement): Promise<void> {
  const modal = getModal();
  if (!modal) return;
  const query = input.value.trim();
  if (!query) {
    renderMessage(modal, modal.dataset.hint ?? "");
    return;
  }
  if (loadFailed) {
    renderMessage(modal, modal.dataset.devNotice ?? "");
    return;
  }
  if (!pagefind) return;

  const search = await pagefind.debouncedSearch(query);
  if (!search) return;

  const results = await Promise.all(
    search.results.slice(0, 8).map((result) => result.data()),
  );
  const container = modal.querySelector("[data-search-results]");
  if (!container) return;

  if (results.length === 0) {
    renderMessage(modal, modal.dataset.noResults ?? "");
    return;
  }

  const list = document.createElement("ul");
  list.className = "flex flex-col gap-1";
  for (const result of results) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = result.url;
    link.className =
      "block rounded-md px-3 py-2.5 transition-colors hover:bg-secondary focus-visible:bg-secondary";
    const title = document.createElement("span");
    title.className = "block text-sm font-semibold";
    title.textContent = result.meta.title ?? result.url;
    const excerpt = document.createElement("span");
    excerpt.className = "mt-0.5 block text-xs leading-relaxed text-muted-foreground";
    excerpt.innerHTML = result.excerpt;
    link.append(title, excerpt);
    item.appendChild(link);
    list.appendChild(item);
  }
  container.innerHTML = "";
  container.appendChild(list);
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-search-open]")) {
    void openSearch();
    return;
  }
  if (target?.closest("[data-search-close]")) {
    getModal()?.close();
    return;
  }
  const modal = getModal();
  if (modal?.open && event.target === modal) {
    modal.close();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const modal = getModal();
    if (modal?.open) {
      modal.close();
    } else {
      void openSearch();
    }
  }
});

document.addEventListener("input", (event) => {
  const input = event.target as HTMLInputElement | null;
  if (!input?.matches("[data-search-input]")) return;
  void runSearch(input);
});

document.addEventListener("astro:before-swap", () => {
  getModal()?.close();
});
