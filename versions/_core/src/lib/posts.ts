import { localeUrl, otherLocale, type Locale } from "@/i18n/ui";
import {
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

export interface Paginated {
  items: Post[];
  current: number;
  last: number;
}

export function paginatePosts(
  posts: Post[],
  pageSize: number,
  current: number,
): Paginated {
  const last = Math.max(1, Math.ceil(posts.length / pageSize));
  const start = (current - 1) * pageSize;
  return { items: posts.slice(start, start + pageSize), current, last };
}

export interface MonthGroup {
  month: number;
  posts: Post[];
}

export function groupByYearMonth(posts: Post[]): [number, MonthGroup[]][] {
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
    .map(([year, months]) => [
      year,
      [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, list]) => ({ month, posts: list })),
    ]);
}
