export type Locale = "fr" | "en";

const DATE_LOCALES: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

/** Words per minute used for the reading estimate shown next to every post. */
const WORDS_PER_MINUTE = 200;

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatDate(date: Date, locale: Locale, style: "long" | "short" = "long"): string {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat(DATE_LOCALES[locale], options).format(date);
}

/** Month name, capitalised: French month names come back lowercase from Intl. */
export function formatMonth(month: Date | number, locale: Locale): string {
  const date = typeof month === "number" ? new Date(2000, month, 1) : month;
  const label = new Intl.DateTimeFormat(DATE_LOCALES[locale], { month: "long" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isoDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/** Truncates on a word boundary when one is close enough to the limit. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

export function githubEditUrl(
  repo: { url: string; branch: string; contentBase: string },
  filePath: string,
): string | null {
  if (!repo.url) return null;
  const base = repo.url.replace(/\/+$/, "");
  const parts = [filePath.startsWith("/") ? "" : repo.contentBase, filePath]
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .join("/");
  return `${base}/edit/${repo.branch}/${parts}`;
}
