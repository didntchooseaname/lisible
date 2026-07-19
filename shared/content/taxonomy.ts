const TAG_ALIASES: Record<string, string> = {
  accessibility: "accessibilite",
  typography: "typographie",
};

export function canonicalTagSlug(slug: string): string {
  return TAG_ALIASES[slug] ?? slug;
}
