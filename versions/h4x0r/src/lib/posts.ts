import {
  getAllSeries,
  getPublishedPosts,
  type Post,
  postLocale,
  postSlug,
  type SeriesInfo,
} from "@shared/lib/posts";
import { type Locale, localeUrl } from "@/i18n/ui";
import { FEATURES } from "@/site.config";

export {
  type AdjacentPosts,
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
  type Post,
  postLocale,
  postSlug,
  type SeriesContext,
  type SeriesInfo,
  slugifyTag,
  type TagInfo,
} from "@shared/lib/posts";

/** Variant-specific helpers: routing, Open Graph paths and local grouping. */

export function postUrl(post: Post): string {
  return localeUrl(postLocale(post), `blog/${postSlug(post)}`);
}

export async function getFeaturedPosts(locale: Locale, count: number): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  if (!FEATURES.pinned) return posts.slice(0, count);
  const pinned = posts.filter((post) => post.data.featured);
  const rest = posts.filter((post) => !post.data.featured);
  return [...pinned, ...rest].slice(0, count);
}

export function hasMath(post: Post): boolean {
  const body = post.body ?? "";
  return body.includes("$$") || /\$[^$\n]+\$/.test(body);
}

export function hasMermaid(post: Post): boolean {
  return (post.body ?? "").includes("```mermaid");
}

export function hasDrawio(post: Post): boolean {
  return (post.body ?? "").includes(":::drawio");
}

export interface PageOf<T> {
  items: T[];
  current: number;
  total: number;
}

export function pageSize(): number {
  return FEATURES.pagination.enabled
    ? Math.max(1, FEATURES.pagination.pageSize)
    : Number.POSITIVE_INFINITY;
}

export function pageOf<T>(items: T[], current: number): PageOf<T> {
  const total = pageCount(items.length);
  const size = pageSize();
  const start = (current - 1) * (Number.isFinite(size) ? size : items.length);
  return {
    items: Number.isFinite(size) ? items.slice(start, start + size) : items,
    current,
    total,
  };
}

export interface ArchiveMonth {
  month: number;
  posts: Post[];
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
  count: number;
}

export async function getArchives(locale: Locale): Promise<ArchiveYear[]> {
  const posts = await getPublishedPosts(locale);
  const years = new Map<number, Map<number, Post[]>>();
  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const month = post.data.pubDate.getMonth() + 1;
    const months = years.get(year) ?? new Map<number, Post[]>();
    const list = months.get(month) ?? [];
    list.push(post);
    months.set(month, list);
    years.set(year, months);
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => {
      const sorted = [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, monthPosts]) => ({ month, posts: monthPosts }));
      return {
        year,
        months: sorted,
        count: sorted.reduce((sum, m) => sum + m.posts.length, 0),
      };
    });
}

export function seriesName(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function getSeriesOf(post: Post): Promise<SeriesInfo | undefined> {
  if (!FEATURES.series || !post.data.series) return undefined;
  const all = await getAllSeries(postLocale(post));
  return all.find((series) => series.slug === post.data.series);
}

export function pageCount(itemCount: number): number {
  if (!FEATURES.pagination.enabled) return 1;
  return Math.max(1, Math.ceil(itemCount / pageSize()));
}
