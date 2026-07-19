const MASTODON_KEY = "mastodon-instance";

function flashLabel(
  el: HTMLElement,
  labelEl: HTMLElement | null,
  doneText: string,
  idleText: string,
) {
  if (labelEl) {
    labelEl.textContent = doneText;
    window.setTimeout(() => {
      labelEl.textContent = idleText;
    }, 1600);
  }
  el.setAttribute("data-done", "true");
  window.setTimeout(() => el.removeAttribute("data-done"), 1600);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function handleCopyMarkdown(button: HTMLElement) {
  const url = button.getAttribute("data-md-url");
  if (!url) return;
  const idle = button.getAttribute("data-label") ?? "";
  const done = button.getAttribute("data-copied") ?? idle;
  const labelEl = button.querySelector<HTMLElement>("[data-copy-label]");
  try {
    const response = await fetch(url);
    const markdown = await response.text();
    const ok = await copyText(markdown);
    if (ok) flashLabel(button, labelEl, done, idle);
  } catch {
  }
}

async function handleCopyLink(button: HTMLElement) {
  const url = button.getAttribute("data-url") ?? window.location.href;
  const done = button.getAttribute("data-copied") ?? "";
  const idle = button.getAttribute("data-label") ?? "";
  const ok = await copyText(url);
  if (!ok) return;
  const previous = button.getAttribute("aria-label");
  button.setAttribute("aria-label", done);
  button.setAttribute("data-done", "true");
  window.setTimeout(() => {
    if (previous) button.setAttribute("aria-label", previous);
    else button.setAttribute("aria-label", idle);
    button.removeAttribute("data-done");
  }, 1600);
}

function normalizeInstance(raw: string): string {
  let value = raw.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return value;
}

function handleMastodon(button: HTMLElement) {
  const title = button.getAttribute("data-title") ?? document.title;
  const url = button.getAttribute("data-url") ?? window.location.href;
  const promptText =
    button
      .closest<HTMLElement>("[data-article-actions]")
      ?.getAttribute("data-mastodon-prompt") ?? "mastodon.social";

  let instance = "";
  try {
    instance = localStorage.getItem(MASTODON_KEY) ?? "";
  } catch {
  }
  if (!instance) {
    const entered = window.prompt(promptText, "mastodon.social");
    if (!entered) return;
    instance = normalizeInstance(entered);
    if (!instance) return;
    try {
      localStorage.setItem(MASTODON_KEY, instance);
    } catch {
    }
  }
  const shareUrl = `https://${instance}/share?text=${encodeURIComponent(`${title} ${url}`)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function init() {
  if (window.__articleActionsBound) return;
  window.__articleActionsBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const copyMd = target.closest<HTMLElement>("[data-copy-markdown]");
    if (copyMd) {
      event.preventDefault();
      void handleCopyMarkdown(copyMd);
      return;
    }
    const copyLink = target.closest<HTMLElement>("[data-copy-link]");
    if (copyLink) {
      event.preventDefault();
      void handleCopyLink(copyLink);
      return;
    }
    const mastodon = target.closest<HTMLElement>("[data-share-mastodon]");
    if (mastodon) {
      event.preventDefault();
      handleMastodon(mastodon);
      return;
    }

    const menu = document.querySelector<HTMLDetailsElement>("[data-ai-menu][open]");
    if (menu && !target.closest("[data-ai-menu]")) {
      menu.removeAttribute("open");
    }
  });
}

init();

declare global {
  interface Window {
    __articleActionsBound?: boolean;
  }
}

export {};
