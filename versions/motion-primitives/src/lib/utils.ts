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
