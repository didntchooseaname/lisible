import {
  getPublishedPosts,
  getSeriesPosts,
  type Post,
  postLocale,
  postSlug,
  seriesSlug,
} from "@shared/lib/posts";
import { defaultLocale, type Locale, localeUrl } from "@/i18n/ui";

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

export async function getFeaturedPosts(
  locale: Locale,
  count: number,
): Promise<{ featured: Post[]; rest: Post[] }> {
  const posts = await getPublishedPosts(locale);
  const pinned = posts.filter((p) => p.data.featured);
  const others = posts.filter((p) => !p.data.featured);
  const featured = [...pinned, ...others].slice(0, count);
  const featuredIds = new Set(featured.map((p) => p.id));
  const rest = posts.filter((p) => !featuredIds.has(p.id));
  return { featured, rest };
}

export function postMdPath(post: Post): string {
  const prefix = postLocale(post) === defaultLocale ? "" : `/${postLocale(post)}`;
  return `${prefix}/blog/${postSlug(post)}.md`;
}

export function seriesName(slug: string): string {
  const spaced = slug.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Reading position inside a series, used by the article navigation. */
export interface SeriesPosition {
  slug: string;
  name: string;
  posts: Post[];
  index: number;
  total: number;
  prev: Post | undefined;
  next: Post | undefined;
}

export async function getSeriesInfo(post: Post): Promise<SeriesPosition | undefined> {
  const name = post.data.series;
  if (!name) return undefined;
  const slug = seriesSlug(name);
  const posts = await getSeriesPosts(postLocale(post), slug);
  const index = posts.findIndex((entry) => entry.id === post.id);
  if (index === -1 || posts.length < 2) return undefined;
  return {
    slug,
    name: seriesName(slug),
    posts,
    index,
    total: posts.length,
    prev: posts[index - 1],
    next: posts[index + 1],
  };
}

export interface Page<T> {
  items: T[];
  current: number;
  total: number;
}

export function pageCount(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function paginate<T>(items: T[], current: number, pageSize: number): Page<T> {
  const total = pageCount(items.length, pageSize);
  const page = Math.min(Math.max(1, current), total);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), current: page, total };
}
