import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "#src/i18n/ui";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const dateLocales: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
};

export function formatDate(
  date: Date,
  locale: Locale,
  style: "long" | "short" = "long",
): string {
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat(dateLocales[locale], options).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

export function formatMonth(date: Date, locale: Locale): string {
  const label = new Intl.DateTimeFormat(dateLocales[locale], { month: "long" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .join("/");
  return `${base}/edit/${repo.branch}/${parts}`;
}
