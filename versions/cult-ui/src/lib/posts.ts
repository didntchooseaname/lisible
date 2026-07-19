import { getCollection, type CollectionEntry } from "astro:content";
import { canonicalTagSlug } from "#shared/content/taxonomy";
import { localeUrl, otherLocale, type Locale } from "#src/i18n/ui";

export type Post = CollectionEntry<"blog">;

export function postLocale(post: Post): Locale {
  return post.id.startsWith("en/") ? "en" : "fr";
}

export function postSlug(post: Post): string {
  return post.id.replace(/^(fr|en)\//, "");
}

export function postUrl(post: Post): string {
  return localeUrl(postLocale(post), `blog/${postSlug(post)}`);
}

export async function getPublishedPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection("blog", (post) => {
    if (postLocale(post) !== locale) return false;
    if (import.meta.env.PROD && post.data.draft) return false;
    return true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function groupByYear(posts: Post[]): [number, Post[]][] {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

export function slugifyTag(tag: string): string {
  const slug = tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return canonicalTagSlug(slug);
}

export interface TagInfo {
  slug: string;
  name: string;
  count: number;
}

export async function getAllTags(locale: Locale): Promise<TagInfo[]> {
  const posts = await getPublishedPosts(locale);
  const tags = new Map<string, TagInfo>();
  for (const post of posts) {
    for (const name of post.data.tags) {
      const slug = slugifyTag(name);
      const info = tags.get(slug) ?? { slug, name, count: 0 };
      info.count += 1;
      tags.set(slug, info);
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

export async function getPostsByTag(
  locale: Locale,
  tagSlug: string,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts.filter((post) =>
    post.data.tags.some((tag) => slugifyTag(tag) === tagSlug),
  );
}

export interface AdjacentPosts {
  older: Post | undefined;
  newer: Post | undefined;
}

export async function getAdjacentPosts(post: Post): Promise<AdjacentPosts> {
  const posts = await getPublishedPosts(postLocale(post));
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return { older: undefined, newer: undefined };
  return {
    older: posts[index + 1],
    newer: posts[index - 1],
  };
}

export async function getRelatedPosts(
  post: Post,
  count = 3,
): Promise<Post[]> {
  const posts = await getPublishedPosts(postLocale(post));
  const tags = new Set(post.data.tags.map(slugifyTag));
  if (tags.size === 0) return [];

  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const other = new Set(p.data.tags.map(slugifyTag));
      const intersection = [...tags].filter((t) => other.has(t)).length;
      const union = new Set([...tags, ...other]).size;
      const score = union === 0 ? 0 : intersection / union;
      return { post: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    )
    .slice(0, count)
    .map((entry) => entry.post);
}


export interface PageData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
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


export interface SeriesInfo {
  slug: string;
  name: string;
  posts: Post[];
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

export async function getSeriesPosts(
  locale: Locale,
  slug: string,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return sortSeries(posts.filter((post) => post.data.series === slug));
}

export async function getAllSeries(locale: Locale): Promise<SeriesInfo[]> {
  const posts = await getPublishedPosts(locale);
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const slug = post.data.series;
    if (!slug) continue;
    const list = groups.get(slug) ?? [];
    list.push(post);
    groups.set(slug, list);
  }
  return [...groups.entries()]
    .map(([slug, list]) => ({
      slug,
      name: seriesName(slug),
      posts: sortSeries(list),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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

export async function getTranslation(post: Post): Promise<Post | undefined> {
  const target = otherLocale(postLocale(post));
  const slug = postSlug(post);
  const posts = await getPublishedPosts(target);
  return posts.find((p) => postSlug(p) === slug);
}
