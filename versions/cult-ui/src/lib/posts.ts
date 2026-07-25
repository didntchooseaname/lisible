import { localeUrl, otherLocale, type Locale } from "@/i18n/ui";
import {
  getSeriesPosts,
  postLocale,
  postSlug,
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

export interface PageData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
}

export function seriesName(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function sortSeries(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
  });
}

export interface PostSeriesContext {
  info: SeriesInfo;
  index: number;
  prev: Post | undefined;
  next: Post | undefined;
}

export async function getPostSeries(
  post: Post,
): Promise<PostSeriesContext | null> {
  const slug = post.data.series;
  if (!slug) return null;
  const posts = await getSeriesPosts(postLocale(post), slug);
  const position = posts.findIndex((entry) => entry.id === post.id);
  if (position === -1) return null;
  return {
    info: { slug, name: seriesName(slug), posts },
    index: position + 1,
    prev: posts[position - 1],
    next: posts[position + 1],
  };
}

export interface MonthGroup {
  month: number;
  posts: Post[];
}

export interface YearGroup {
  year: number;
  months: MonthGroup[];
}

export function groupByYearMonth(posts: Post[]): YearGroup[] {
  const years = new Map<number, Map<number, Post[]>>();
  for (const post of posts) {
    const date = post.data.pubDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const months = years.get(year) ?? new Map<number, Post[]>();
    const list = months.get(month) ?? [];
    list.push(post);
    months.set(month, list);
    years.set(year, months);
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, list]) => ({ month, posts: list })),
    }));
}

export function paginate<T>(
  items: T[],
  pageSize: number,
  page: number,
): PageData<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    pageSize,
    total: items.length,
  };
}
