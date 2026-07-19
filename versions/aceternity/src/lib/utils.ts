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

export function hasMath(body: string | undefined): boolean {
  if (!body) return false;
  if (/\$\$[\s\S]+?\$\$/.test(body)) return true;
  return /(?<![\\$])\$(?!\s)[^\n$]+?(?<!\s)\$/.test(body);
}
