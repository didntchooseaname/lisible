import { localeUrl, otherLocale, type Locale } from "@/i18n/ui";
import {
  getPublishedPosts,
  postLocale,
  postSlug,
  type Post,
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

export function postMarkdownUrl(post: Post): string {
  const base = localeUrl(postLocale(post), "blog");
  return `${base}${postSlug(post)}.md`;
}

export function blogPageUrl(locale: Locale, page: number): string {
  return page <= 1
    ? localeUrl(locale, "blog")
    : localeUrl(locale, `blog/${page}`);
}

export function tagPageUrl(
  locale: Locale,
  tagSlug: string,
  page: number,
): string {
  return page <= 1
    ? localeUrl(locale, `tags/${tagSlug}`)
    : localeUrl(locale, `tags/${tagSlug}/${page}`);
}

export function seriesUrl(locale: Locale, slug: string): string {
  return localeUrl(locale, `series/${slug}`);
}

export async function blogPageCount(
  locale: Locale,
  pageSize: number,
): Promise<number> {
  const posts = await getPublishedPosts(locale);
  return Math.max(1, Math.ceil(posts.length / Math.max(1, pageSize)));
}

export interface Page<T> {
  items: T[];
  current: number;
  total: number;
}

export function paginate<T>(items: T[], pageSize: number): Page<T>[] {
  const size = Math.max(1, pageSize);
  const total = Math.max(1, Math.ceil(items.length / size));
  const pages: Page<T>[] = [];
  for (let current = 1; current <= total; current++) {
    pages.push({
      items: items.slice((current - 1) * size, current * size),
      current,
      total,
    });
  }
  return pages;
}

export function selectFeatured(posts: Post[], count: number): Post[] {
  const pinned = posts.filter((p) => p.data.featured);
  const rest = posts.filter((p) => !p.data.featured);
  return [...pinned, ...rest].slice(0, count);
}
