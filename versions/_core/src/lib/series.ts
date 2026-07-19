import { getPublishedPosts, postLocale, type Post } from "@/lib/posts";
import { readingTime } from "@/lib/utils";
import type { Locale } from "#src/i18n/ui";

export function seriesTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortSeries(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const oa = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const ob = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
  });
}

export async function getSeriesPosts(
  locale: Locale,
  slug: string,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return sortSeries(posts.filter((p) => p.data.series === slug));
}

export interface SeriesInfo {
  slug: string;
  title: string;
  count: number;
  totalMinutes: number;
}

export async function getAllSeries(locale: Locale): Promise<SeriesInfo[]> {
  const posts = await getPublishedPosts(locale);
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const slug = post.data.series;
    if (!slug) continue;
    const list = map.get(slug) ?? [];
    list.push(post);
    map.set(slug, list);
  }
  return [...map.entries()].map(([slug, list]) => ({
    slug,
    title: seriesTitle(slug),
    count: list.length,
    totalMinutes: totalReadingTime(list),
  }));
}

export function totalReadingTime(posts: Post[]): number {
  return posts.reduce((sum, post) => sum + readingTime(post.body ?? ""), 0);
}

export interface SeriesContext {
  slug: string;
  title: string;
  posts: Post[];
  index: number;
  prev: Post | undefined;
  next: Post | undefined;
  totalMinutes: number;
}

export async function getSeriesContext(
  post: Post,
): Promise<SeriesContext | null> {
  const slug = post.data.series;
  if (!slug) return null;
  const locale = postLocale(post);
  const posts = await getSeriesPosts(locale, slug);
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return null;
  return {
    slug,
    title: seriesTitle(slug),
    posts,
    index,
    prev: posts[index - 1],
    next: posts[index + 1],
    totalMinutes: totalReadingTime(posts),
  };
}
