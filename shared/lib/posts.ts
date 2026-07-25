import { type CollectionEntry, getCollection } from "astro:content";
import { canonicalTagSlug } from "../content/taxonomy";
import type { Locale } from "./format";

/**
 * Locale-aware queries over the blog collection, shared by every variant.
 *
 * Nothing here builds a URL: routing helpers stay in each variant's i18n module,
 * so this file can be the single source of truth for what a published post is,
 * how posts are ordered, and how tags are normalised.
 */
export type Post = CollectionEntry<"blog">;

export function postLocale(post: Post): Locale {
  return post.id.startsWith("en/") ? "en" : "fr";
}

/** Collection ids carry a locale prefix that never appears in the URL. */
export function postSlug(post: Post): string {
  return post.id.replace(/^(fr|en)\//, "");
}

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

/** Drafts stay visible while writing and disappear from every production output. */
export async function getPublishedPosts(locale: Locale): Promise<Post[]> {
  const posts = await getCollection("blog", (post) => {
    if (postLocale(post) !== locale) return false;
    if (import.meta.env.PROD && post.data.draft) return false;
    return true;
  });
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
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
    .replace(/[̀-ͯ]/g, "")
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
  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getPostsByTag(locale: Locale, tagSlug: string): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts.filter((post) => post.data.tags.some((tag) => slugifyTag(tag) === tagSlug));
}

export interface AdjacentPosts {
  older: Post | undefined;
  newer: Post | undefined;
}

export async function getAdjacentPosts(post: Post): Promise<AdjacentPosts> {
  const posts = await getPublishedPosts(postLocale(post));
  const index = posts.findIndex((entry) => entry.id === post.id);
  if (index === -1) return { older: undefined, newer: undefined };
  return { older: posts[index + 1], newer: posts[index - 1] };
}

/** Jaccard similarity over tags, most recent first on ties. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const tags = new Set(post.data.tags.map((tag) => slugifyTag(tag)));
  if (tags.size === 0) return [];
  const posts = await getPublishedPosts(postLocale(post));

  return posts
    .filter((entry) => entry.id !== post.id)
    .map((entry) => {
      const other = new Set(entry.data.tags.map((tag) => slugifyTag(tag)));
      let shared = 0;
      for (const tag of tags) if (other.has(tag)) shared += 1;
      const union = new Set([...tags, ...other]).size;
      return { post: entry, score: union === 0 ? 0 : shared / union };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}

/** The translation link is the identical filename under the other locale. */
export async function getTranslation(post: Post): Promise<Post | undefined> {
  const slug = postSlug(post);
  const posts = await getPublishedPosts(otherLocale(postLocale(post)));
  return posts.find((entry) => postSlug(entry) === slug);
}

export interface SeriesInfo {
  /** URL-safe identifier. */
  slug: string;
  /** Raw frontmatter value, used as the display title. */
  name: string;
  posts: Post[];
}

/**
 * Series are declared in frontmatter as human titles ("Architecture web moderne").
 * Using them verbatim in a URL produces percent-encoded spaces, so the routes key
 * on a slug and keep the original string for display.
 */
export function seriesSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Explicit seriesOrder wins; posts without one fall back to chronological order. */
export async function getSeriesPosts(locale: Locale, slug: string): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts
    .filter((post) => post.data.series && seriesSlug(post.data.series) === slug)
    .sort((a, b) => {
      const first = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const second = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (first !== second) return first - second;
      return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
    });
}

export async function getAllSeries(locale: Locale): Promise<SeriesInfo[]> {
  const posts = await getPublishedPosts(locale);
  const names = new Map<string, string>();
  for (const post of posts) {
    if (post.data.series) names.set(seriesSlug(post.data.series), post.data.series);
  }
  const series = await Promise.all(
    [...names].map(async ([slug, name]) => ({
      slug,
      name,
      posts: await getSeriesPosts(locale, slug),
    })),
  );
  return series.sort((a, b) => a.name.localeCompare(b.name));
}

export interface SeriesContext {
  slug: string;
  name: string;
  posts: Post[];
  index: number;
  prev: Post | undefined;
  next: Post | undefined;
}

export async function getSeriesContext(post: Post): Promise<SeriesContext | undefined> {
  const name = post.data.series;
  if (!name) return undefined;
  const slug = seriesSlug(name);
  const posts = await getSeriesPosts(postLocale(post), slug);
  const index = posts.findIndex((entry) => entry.id === post.id);
  if (index === -1) return undefined;
  return { slug, name, posts, index, prev: posts[index - 1], next: posts[index + 1] };
}
