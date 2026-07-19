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

export function postOgPath(post: Post): string {
  return `/og/${postLocale(post)}/${postSlug(post)}.png`;
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
  limit = 3,
): Promise<Post[]> {
  const selfTags = new Set(post.data.tags);
  if (selfTags.size === 0) return [];
  const posts = await getPublishedPosts(postLocale(post));
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const tags = new Set(candidate.data.tags);
      const intersection = [...selfTags].filter((tag) => tags.has(tag)).length;
      const union = new Set([...selfTags, ...tags]).size;
      return { post: candidate, score: union > 0 ? intersection / union : 0 };
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

export interface SeriesInfo {
  slug: string;
  posts: Post[];
}

export async function getSeries(post: Post): Promise<SeriesInfo | undefined> {
  const slug = post.data.series;
  if (!slug) return undefined;
  const posts = await getSeriesPosts(postLocale(post), slug);
  if (posts.length < 2) return undefined;
  return { slug, posts };
}

export async function getSeriesPosts(
  locale: Locale,
  slug: string,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts
    .filter((post) => post.data.series === slug)
    .sort((a, b) => {
      const oa = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const ob = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      return oa - ob || a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
    });
}

export async function getSeriesSlugs(locale: Locale): Promise<string[]> {
  const posts = await getPublishedPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.data.series) {
      counts.set(post.data.series, (counts.get(post.data.series) ?? 0) + 1);
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

export async function getTranslation(post: Post): Promise<Post | undefined> {
  const target = otherLocale(postLocale(post));
  const slug = postSlug(post);
  const posts = await getPublishedPosts(target);
  return posts.find((p) => postSlug(p) === slug);
}
