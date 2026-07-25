import { localeUrl, otherLocale, type Locale } from "@/i18n/ui";
import {
  getPublishedPosts,
  getSeriesPosts,
  postLocale,
  postSlug,
  seriesSlug,
  type Post,
  type SeriesInfo,
} from "@shared/lib/posts";

export {
  getAdjacentPosts,
  getAllSeries,
  getAllTags,
  getPostsByTag,
  getPublishedPosts,
  getRelatedPosts,
  getSeriesContext,
  getSeriesPosts,
  getTranslation,
  groupByYear,
  otherLocale,
  postLocale,
  postSlug,
  slugifyTag,
  type AdjacentPosts,
  type Post,
  type SeriesContext,
  type SeriesInfo,
  type TagInfo,
} from "@shared/lib/posts";

/** Variant-specific helpers: routing, Open Graph paths and local grouping. */

export function postUrl(post: Post): string {
  return localeUrl(postLocale(post), `blog/${postSlug(post)}`);
}


export function postMarkdownPath(post: Post): string {
  const prefix = postLocale(post) === "en" ? "/en" : "";
  return `${prefix}/blog/${postSlug(post)}.md`;
}

export function postFilePath(post: Post): string {
  const filePath = (post as { filePath?: string }).filePath;
  const extension = filePath?.endsWith(".mdx") ? "mdx" : "md";
  return `/shared/content/blog/${post.id}.${extension}`;
}

export async function getAllPublishedPosts(): Promise<Post[]> {
  const fr = await getPublishedPosts("fr");
  const en = await getPublishedPosts("en");
  return [...fr, ...en];
}

const seriesNames: Record<Locale, Record<string, string>> = {
  fr: { "sous-le-capot": "Sous le capot" },
  en: { "sous-le-capot": "Under the hood" },
};

function humanizeSlug(slug: string): string {
  const words = slug.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function seriesName(slug: string, locale: Locale): string {
  return seriesNames[locale][slug] ?? humanizeSlug(slug);
}

export async function getSeries(post: Post): Promise<SeriesInfo | undefined> {
  const name = post.data.series;
  if (!name) return undefined;
  const slug = seriesSlug(name);
  const posts = await getSeriesPosts(postLocale(post), slug);
  if (posts.length < 2) return undefined;
  return { slug, name, posts };
}

export async function getSeriesSlugs(locale: Locale): Promise<string[]> {
  const posts = await getPublishedPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.data.series) {
      const slug = seriesSlug(post.data.series);
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return [...counts.keys()];
}

export interface Page<T> {
  items: T[];
  current: number;
  total: number;
  prevUrl: string | undefined;
  nextUrl: string | undefined;
}

export function paginate<T>(
  all: T[],
  page: number,
  size: number,
  baseUrl: string,
): Page<T> {
  const total = Math.max(1, Math.ceil(all.length / size));
  const current = Math.min(Math.max(1, page), total);
  const start = (current - 1) * size;
  const pageUrl = (n: number) =>
    n <= 1 ? baseUrl : `${baseUrl}${n}/`;
  return {
    items: all.slice(start, start + size),
    current,
    total,
    prevUrl: current > 1 ? pageUrl(current - 1) : undefined,
    nextUrl: current < total ? pageUrl(current + 1) : undefined,
  };
}
