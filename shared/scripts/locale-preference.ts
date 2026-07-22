import { navigate } from "astro:transitions/client";

type Locale = "fr" | "en";
type NavigationRequest = {
  locale: Locale;
  target: string;
  history: "push" | "replace";
};

const isPreviewBuild = import.meta.env.BASE_URL.startsWith("/_previews/");
const landingSourcePath: Record<Locale, string> = {
  fr: "/landing/french/",
  en: "/en/",
};

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
    // Navigation remains functional when storage is unavailable.
  }
}

function preferredLocale(): Locale {
  const legacyQuery = new URLSearchParams(location.search).get("lisible-locale");
  if (legacyQuery === "fr" || legacyQuery === "en") {
    persistLocale(legacyQuery);
    return legacyQuery;
  }

  const stored = storedLocale();
  if (stored) return stored;

  const detected = navigator.languages?.find((language) => /^(fr|en)(-|$)/i.test(language))
    ?? navigator.language;
  return /^fr(-|$)/i.test(detected ?? "") ? "fr" : "en";
}

function currentLocale(): Locale {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

function isHomePath(path = location.pathname): boolean {
  return path === "/" || path === "/en/" || path === "/landing/french/";
}

function fallbackPath(locale: Locale): string {
  const path = location.pathname;
  if (path === "/landing/french/") return locale === "fr" ? "/" : "/en/";

  const isEnglish = /^\/en(?:\/|$)/.test(path);
  if ((locale === "en") === isEnglish) return path;
  if (locale === "en") return path === "/" ? "/en/" : `/en${path}`;
  return path.replace(/^\/en(?=\/|$)/, "") || "/";
}

function targetFor(locale: Locale): string {
  if (isHomePath()) return landingSourcePath[locale];

  const anchor = document.querySelector<HTMLAnchorElement>(`a[hreflang="${locale}"]`);
  const alternate = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${locale}"]`,
  );
  const href = anchor?.href ?? alternate?.href;
  if (href) {
    const url = new URL(href, location.href);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const url = new URL(location.href);
  url.pathname = fallbackPath(locale);
  url.searchParams.delete("lisible-locale");
  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizeLandingUrl(): void {
  if (!isHomePath()) return;
  if (location.pathname !== "/" || new URLSearchParams(location.search).has("lisible-locale")) {
    history.replaceState(history.state, "", "/");
  }
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const rootUrl = new URL("/", canonical?.href ?? location.origin).toString();
  canonical?.setAttribute("href", rootUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", rootUrl);
}

function removeLegacyQuery(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has("lisible-locale")) return;
  url.searchParams.delete("lisible-locale");
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function revealDocument(): void {
  document.documentElement.style.removeProperty("visibility");
}

let navigating = false;
let pendingNavigation: NavigationRequest | null = null;
let scheduled = false;

async function drainNavigationQueue(): Promise<void> {
  if (navigating) return;

  while (pendingNavigation) {
    const request = pendingNavigation;
    pendingNavigation = null;

    if (currentLocale() === request.locale) {
      removeLegacyQuery();
      revealDocument();
      continue;
    }

    navigating = true;
    try {
      await navigate(request.target, { history: request.history });
      normalizeLandingUrl();
    } catch (error) {
      console.error("Locale navigation failed", error);
      revealDocument();
    } finally {
      navigating = false;
    }
  }

  revealDocument();
}

function requestNavigation(request: NavigationRequest): void {
  pendingNavigation = request;
  void drainNavigationQueue();
}

function syncLocale(): void {
  if (document.querySelector("[data-not-found-root]")) {
    revealDocument();
    return;
  }

  const preferred = preferredLocale();
  if (currentLocale() === preferred) {
    removeLegacyQuery();
    revealDocument();
    return;
  }

  requestNavigation({
    locale: preferred,
    target: targetFor(preferred),
    history: "replace",
  });
}

function scheduleLocaleSync(): void {
  if (isPreviewBuild || document.documentElement.dataset.lisiblePreview === "true") {
    revealDocument();
    return;
  }
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    syncLocale();
  });
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

  const locale = languageLink.hreflang;
  persistLocale(locale);
  const url = new URL(languageLink.href, location.href);
  requestNavigation({
    locale,
    target: `${url.pathname}${url.search}${url.hash}`,
    history: "push",
  });
}, { capture: true });

scheduleLocaleSync();
document.addEventListener("astro:page-load", scheduleLocaleSync);
