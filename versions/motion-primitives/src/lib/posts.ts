import { getCollection, type CollectionEntry } from "astro:content";
import { canonicalTagSlug } from "#shared/content/taxonomy";
import { localeUrl, otherLocale, defaultLocale, type Locale } from "#src/i18n/ui";

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

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const tags = new Set(post.data.tags);
  if (tags.size === 0) return [];
  const posts = await getPublishedPosts(postLocale(post));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const other = new Set(p.data.tags);
      const intersection = [...tags].filter((tag) => other.has(tag)).length;
      const union = new Set([...tags, ...other]).size;
      return { post: p, score: union === 0 ? 0 : intersection / union };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map((entry) => entry.post);
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

export async function getTranslation(post: Post): Promise<Post | undefined> {
  const target = otherLocale(postLocale(post));
  const slug = postSlug(post);
  const posts = await getPublishedPosts(target);
  return posts.find((p) => postSlug(p) === slug);
}

export function postOgPath(post: Post): string {
  return `/og/blog/${postLocale(post)}/${postSlug(post)}.png`;
}

export function postOgKey(post: Post): string {
  return `blog/${postLocale(post)}/${postSlug(post)}`;
}

export function postMdPath(post: Post): string {
  const prefix = postLocale(post) === defaultLocale ? "" : `/${postLocale(post)}`;
  return `${prefix}/blog/${postSlug(post)}.md`;
}


export function seriesName(slug: string): string {
  const spaced = slug.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export async function getSeriesPosts(locale: Locale, slug: string): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts
    .filter((p) => p.data.series === slug)
    .sort(
      (a, b) =>
        (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0) ||
        a.data.pubDate.valueOf() - b.data.pubDate.valueOf(),
    );
}

export interface SeriesInfo {
  slug: string;
  name: string;
  posts: Post[];
  index: number;
  total: number;
  prev: Post | undefined;
  next: Post | undefined;
}

export async function getSeriesInfo(post: Post): Promise<SeriesInfo | undefined> {
  const slug = post.data.series;
  if (!slug) return undefined;
  const posts = await getSeriesPosts(postLocale(post), slug);
  const index = posts.findIndex((p) => p.id === post.id);
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

export async function getAllSeries(
  locale: Locale,
): Promise<{ slug: string; name: string; posts: Post[] }[]> {
  const posts = await getPublishedPosts(locale);
  const slugs = new Set<string>();
  for (const post of posts) {
    if (post.data.series) slugs.add(post.data.series);
  }
  const series = await Promise.all(
    [...slugs].map(async (slug) => ({
      slug,
      name: seriesName(slug),
      posts: await getSeriesPosts(locale, slug),
    })),
  );
  return series.sort((a, b) => a.name.localeCompare(b.name));
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
