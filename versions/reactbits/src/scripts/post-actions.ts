
const MASTODON_KEY = "mastodon-instance";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function flash(button: HTMLElement, label: string): void {
  const span = button.querySelector<HTMLElement>("[data-copy-markdown-label]");
  if (span) {
    const previous = span.textContent;
    span.textContent = label;
    window.setTimeout(() => {
      span.textContent = previous;
    }, 1600);
  }
  button.classList.add("is-done");
  window.setTimeout(() => button.classList.remove("is-done"), 1600);
}

function normalizeInstance(raw: string): string | null {
  const value = raw.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!value || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return null;
  return value;
}

function init(): void {
  if ((window as unknown as { __postActionsBound?: boolean }).__postActionsBound) {
    return;
  }
  (window as unknown as { __postActionsBound?: boolean }).__postActionsBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const container = target.closest<HTMLElement>("[data-post-actions]");

    const mdButton = target.closest<HTMLElement>("[data-copy-markdown]");
    if (mdButton && container) {
      const source = container.querySelector<HTMLTextAreaElement>(
        "[data-markdown-source]",
      );
      if (source) {
        void copyText(source.value).then((ok) => {
          if (ok) flash(mdButton, container.dataset.mdCopied ?? "");
        });
      }
      return;
    }

    const copyButton = target.closest<HTMLElement>("[data-share-copy]");
    if (copyButton && container) {
      const url = copyButton.dataset.url ?? window.location.href;
      void copyText(url).then((ok) => {
        if (!ok) return;
        copyButton.classList.add("is-copied");
        window.setTimeout(() => copyButton.classList.remove("is-copied"), 1600);
      });
      return;
    }

    const mastodonButton = target.closest<HTMLElement>("[data-share-mastodon]");
    if (mastodonButton && container) {
      let instance = localStorage.getItem(MASTODON_KEY);
      if (!instance) {
        const answer = window.prompt(container.dataset.mastodonPrompt ?? "");
        if (!answer) return;
        instance = normalizeInstance(answer);
        if (!instance) return;
        localStorage.setItem(MASTODON_KEY, instance);
      }
      const md = container.querySelector<HTMLTextAreaElement>("[data-markdown-source]");
      const title = md ? md.value.split("\n")[0]?.replace(/^#\s*/, "") ?? "" : document.title;
      const url = container
        .querySelector<HTMLElement>("[data-share-copy]")
        ?.dataset.url ?? window.location.href;
      const shareUrl = `https://${instance}/share?text=${encodeURIComponent(`${title} ${url}`)}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      return;
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    document.querySelectorAll<HTMLDetailsElement>(".post-ai[open]").forEach((menu) => {
      if (!menu.contains(target)) menu.open = false;
    });
  });

  document.addEventListener("astro:before-swap", () => {
    document.querySelectorAll<HTMLDetailsElement>(".post-ai[open]").forEach((menu) => {
      menu.open = false;
    });
  });
}

init();
