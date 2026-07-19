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
  const own = new Set(post.data.tags.map(slugifyTag));
  if (own.size === 0) return [];
  const posts = await getPublishedPosts(postLocale(post));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const other = new Set(p.data.tags.map(slugifyTag));
      const intersection = [...own].filter((tag) => other.has(tag)).length;
      const union = new Set([...own, ...other]).size;
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

export function selectFeatured(posts: Post[], count: number): Post[] {
  const pinned = posts.filter((p) => p.data.featured);
  const rest = posts.filter((p) => !p.data.featured);
  return [...pinned, ...rest].slice(0, count);
}

export async function getTranslation(post: Post): Promise<Post | undefined> {
  const target = otherLocale(postLocale(post));
  const slug = postSlug(post);
  const posts = await getPublishedPosts(target);
  return posts.find((p) => postSlug(p) === slug);
}
