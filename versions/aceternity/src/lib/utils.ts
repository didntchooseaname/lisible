export * from "@shared/lib/utils";

/** Detects inline or block TeX so the KaTeX stylesheet is only loaded when used. */
export function hasMath(body: string | undefined): boolean {
  if (!body) return false;
  if (/\$\$[\s\S]+?\$\$/.test(body)) return true;
  return /(?<![\\$])\$(?!\s)[^\n$]+?(?<!\s)\$/.test(body);
}
