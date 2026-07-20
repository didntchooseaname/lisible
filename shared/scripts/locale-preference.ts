import { navigate } from "astro:transitions/client";

type Locale = "fr" | "en";

const isPreviewBuild = import.meta.env.BASE_URL.startsWith("/_previews/");

const landingSourcePath: Record<Locale, string> = {
  fr: "/landing/french/",
  en: "/?lisible-locale=en",
};

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

function currentLocale(): Locale {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

function isLandingPath(): boolean {
  return location.pathname === "/" || location.pathname === "/landing/french/";
}

function revealLanding(): void {
  document.documentElement.style.removeProperty("visibility");
}

function normalizeLandingUrl(): void {
  if (location.pathname !== "/" || location.search === "?lisible-locale=en") {
    history.replaceState(history.state, "", "/");
  }
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const rootUrl = new URL("/", canonical?.href ?? location.origin).toString();
  canonical?.setAttribute("href", rootUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", rootUrl);
}

function switchLanding(locale: Locale, persist = false): void {
  if (persist) localStorage.setItem("lisible-locale", locale);

  if (currentLocale() === locale && location.pathname === "/") {
    normalizeLandingUrl();
    revealLanding();
    return;
  }
  if (navigating) return;

  navigating = true;
  void navigate(landingSourcePath[locale], { history: "replace" })
    .then(() => {
      if (currentLocale() !== locale) return;
      normalizeLandingUrl();
      revealLanding();
    })
    .catch(() => revealLanding())
    .finally(() => {
      navigating = false;
    });
}

function syncLanding(): boolean {
  if (!isLandingPath()) return false;

  const preferred = preferredLocale();
  if (currentLocale() !== preferred) {
    switchLanding(preferred);
    return true;
  }

  normalizeLandingUrl();
  revealLanding();
  return true;
}

function syncLocale(): void {
  if (navigating || document.querySelector("[data-not-found-root]")) return;
  if (syncLanding()) return;
  const targetPath = pathFor(preferredLocale());
  if (!targetPath) return;

  navigating = true;
  const target = `${targetPath}${location.search}${location.hash}`;
  void navigate(target, { history: "replace" }).finally(() => {
    navigating = false;
  });
}

function scheduleLocaleSync(): void {
  if (isPreviewBuild || document.documentElement.dataset.lisiblePreview === "true") return;
  if (isLandingPath()) {
    syncLocale();
    return;
  }
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

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const languageLink = target?.closest<HTMLAnchorElement>('a[hreflang="fr"], a[hreflang="en"]');
  if (languageLink?.hreflang !== "fr" && languageLink?.hreflang !== "en") return;

  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((dialog) => dialog.close());
  localStorage.setItem("lisible-locale", languageLink.hreflang);
  if (isLandingPath()) {
    switchLanding(languageLink.hreflang);
    return;
  }
  if (navigating) return;
  navigating = true;
  const url = new URL(languageLink.href, location.href);
  void navigate(`${url.pathname}${url.search}${url.hash}`).finally(() => {
    navigating = false;
  });
}, { capture: true });

scheduleLocaleSync();
document.addEventListener("astro:page-load", scheduleLocaleSync);
