import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  formatDate,
  formatMonth,
  githubEditUrl,
  isoDate,
  readingTime,
  truncate,
} from "@shared/lib/format";

/** Tailwind class merging stays per variant: each one tunes its own utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Detects inline or block TeX so the KaTeX stylesheet is only loaded when used. */
export function hasMath(body: string | undefined): boolean {
  if (!body) return false;
  if (/\$\$[\s\S]+?\$\$/.test(body)) return true;
  return /(?<![\\$])\$(?!\s)[^\n$]+?(?<!\s)\$/.test(body);
}
