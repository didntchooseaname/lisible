import { navigate } from "astro:transitions/client";

type Locale = "fr" | "en";

const isPreviewBuild = import.meta.env.BASE_URL.startsWith("/_previews/");

/**
 * Locale handling deliberately never sniffs `navigator.language`.
 *
 * The site is statically prerendered per locale: `/` is French, `/en/` is English,
 * and the hreflang map says exactly that. Auto-redirecting on browser language
 * would make a shared French link open in English, would contradict the declared
 * hreflang, and would force the document to stay hidden until JavaScript ran.
 * Only an explicit choice made through the language switcher is stored, and it is
 * replayed solely when the visitor re-enters through a home URL.
 */
function storedLocale(): Locale | null {
  try {
    const stored = localStorage.getItem("lisible-locale");
    return stored === "fr" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem("lisible-locale", locale);
  } catch {
    // Navigation stays functional when storage is unavailable.
  }
}

function currentLocale(): Locale {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

function isHomePath(path = location.pathname): boolean {
  return path === "/" || path === "/en/";
}

function homeFor(locale: Locale): string {
  return locale === "fr" ? "/" : "/en/";
}

function removeLegacyQuery(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has("lisible-locale")) return;
  url.searchParams.delete("lisible-locale");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

let navigating = false;

async function goTo(target: string, mode: "push" | "replace"): Promise<void> {
  if (navigating) return;
  navigating = true;
  try {
    await navigate(target, { history: mode });
  } catch (error) {
    console.error("Locale navigation failed", error);
    location.assign(target);
  } finally {
    navigating = false;
  }
}

/**
 * Replays a previously chosen locale, but only on a home URL: deep links must
 * keep resolving to the exact page that was shared.
 */
function syncLocale(): void {
  removeLegacyQuery();
  if (isPreviewBuild || document.documentElement.dataset.lisiblePreview === "true") return;
  if (document.querySelector("[data-not-found-root]")) return;
  if (!isHomePath()) return;

  const preferred = storedLocale();
  if (!preferred || preferred === currentLocale()) return;

  void goTo(homeFor(preferred), "replace");
}

document.addEventListener("click", (event) => {
  if (
    event instanceof MouseEvent
    && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
  ) return;

  const target = event.target instanceof Element ? event.target : null;
  const languageLink = target?.closest<HTMLAnchorElement>('a[hreflang="fr"], a[hreflang="en"]');
  if (languageLink?.hreflang !== "fr" && languageLink?.hreflang !== "en") return;
  if (languageLink.hasAttribute("download") || (languageLink.target && languageLink.target !== "_self")) return;

  event.preventDefault();
  document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((dialog) => dialog.close());

  persistLocale(languageLink.hreflang);
  const url = new URL(languageLink.href, location.href);
  void goTo(`${url.pathname}${url.search}${url.hash}`, "push");
}, { capture: true });

syncLocale();
document.addEventListener("astro:page-load", syncLocale);
