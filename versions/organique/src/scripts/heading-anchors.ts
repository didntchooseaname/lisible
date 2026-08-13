// Values mirror the anchorCopied pair of src/i18n/ui.ts; this script ships
// inlined in the page, so it cannot import the dictionary.
const COPIED = { fr: "Lien copié", en: "Link copied" } as const;

// Local copy of shared/scripts/announce: inline scripts cannot import.
let live: HTMLElement | null = null;
function announce(message: string): void {
  if (!live?.isConnected) {
    live = document.createElement("p");
    live.setAttribute("role", "status");
    live.style.cssText =
      "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0";
    document.body.append(live);
  }
  live.textContent = "";
  const region = live;
  window.setTimeout(() => {
    region.textContent = message;
  }, 30);
}

function initHeadingAnchors() {
  document.removeEventListener("click", onClick);
  document.addEventListener("click", onClick);
}

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("[data-heading-anchor]");
  if (!anchor) return;
  if (!navigator.clipboard) return;

  event.preventDefault();
  const url = new URL(anchor.getAttribute("href") ?? "", window.location.href).toString();
  history.replaceState(null, "", anchor.getAttribute("href") ?? "");
  navigator.clipboard.writeText(url).then(
    () => {
      anchor.classList.add("is-copied");
      window.setTimeout(() => anchor.classList.remove("is-copied"), 1400);
      announce(document.documentElement.lang === "en" ? COPIED.en : COPIED.fr);
    },
    () => {},
  );
}

document.addEventListener("astro:page-load", initHeadingAnchors);

export {};
