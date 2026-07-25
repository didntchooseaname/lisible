import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { formatDate, formatMonth, githubEditUrl, isoDate, readingTime, truncate } from "./format";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
