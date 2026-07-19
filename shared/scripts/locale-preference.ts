import { navigate } from "astro:transitions/client";

type Locale = "fr" | "en";

function preferredLocale(): Locale {
  const stored = localStorage.getItem("lisible-locale");
  if (stored === "fr" || stored === "en") return stored;

  const detected = navigator.languages?.find((language) => /^(fr|en)(-|$)/i.test(language))
    ?? navigator.language;
  return /^fr(-|$)/i.test(detected ?? "") ? "fr" : "en";
}

function pathFor(locale: Locale): string | null {
  const path = location.pathname;
  const isEnglish = /^\/en(?:\/|$)/.test(path);
  if ((locale === "en") === isEnglish) return null;
  if (locale === "en") return path === "/" ? "/en/" : `/en${path}`;
  return path.replace(/^\/en(?=\/|$)/, "") || "/";
}

let navigating = false;
let scheduled = false;
let waitingForLoad = false;

function syncLocale(): void {
  if (navigating || document.querySelector("[data-not-found-root]")) return;
  const targetPath = pathFor(preferredLocale());
  if (!targetPath) return;

  navigating = true;
  const target = `${targetPath}${location.search}${location.hash}`;
  void navigate(target, { history: "replace" }).finally(() => {
    navigating = false;
  });
}

function scheduleLocaleSync(): void {
  if (document.readyState !== "complete") {
    if (waitingForLoad) return;
    waitingForLoad = true;
    window.addEventListener("load", () => {
      waitingForLoad = false;
      scheduleLocaleSync();
    }, { once: true });
    return;
  }
  if (scheduled) return;
  scheduled = true;
  const waitForEagerIslands = () => {
    if (document.querySelector('astro-island[client="load"][ssr]')) {
      requestAnimationFrame(waitForEagerIslands);
      return;
    }
    scheduled = false;
    syncLocale();
  };
  requestAnimationFrame(waitForEagerIslands);
}

scheduleLocaleSync();
document.addEventListener("astro:page-load", scheduleLocaleSync);
