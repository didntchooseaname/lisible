import { getCollection, type CollectionEntry } from "astro:content";
import { canonicalTagSlug } from "#shared/content/taxonomy";
import { localeUrl, otherLocale, type Locale } from "#src/i18n/ui";
import { FEATURES } from "#src/site.config";

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

export async function getFeaturedPosts(
  locale: Locale,
  count: number,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  if (!FEATURES.pinned) return posts.slice(0, count);
  const pinned = posts.filter((post) => post.data.featured);
  const rest = posts.filter((post) => !post.data.featured);
  return [...pinned, ...rest].slice(0, count);
}

export async function getRelatedPosts(post: Post, max = 3): Promise<Post[]> {
  const tags = new Set(post.data.tags.map(slugifyTag));
  if (tags.size === 0) return [];
  const posts = await getPublishedPosts(postLocale(post));

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const candidateTags = new Set(candidate.data.tags.map(slugifyTag));
      const intersection = [...tags].filter((tag) => candidateTags.has(tag)).length;
      const union = new Set([...tags, ...candidateTags]).size;
      return { candidate, score: union === 0 ? 0 : intersection / union };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.data.pubDate.valueOf() - a.candidate.data.pubDate.valueOf(),
    )
    .slice(0, max)
    .map(({ candidate }) => candidate);
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

export function pageCount(itemCount: number): number {
  if (!FEATURES.pagination.enabled) return 1;
  return Math.max(1, Math.ceil(itemCount / pageSize()));
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


export interface SeriesInfo {
  slug: string;
  name: string;
  posts: Post[];
}

export function seriesName(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function getAllSeries(locale: Locale): Promise<SeriesInfo[]> {
  if (!FEATURES.series) return [];
  const posts = await getPublishedPosts(locale);
  const bySlug = new Map<string, Post[]>();
  for (const post of posts) {
    const slug = post.data.series;
    if (!slug) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(post);
    bySlug.set(slug, list);
  }
  return [...bySlug.entries()]
    .map(([slug, seriesPosts]) => ({
      slug,
      name: seriesName(slug),
      posts: seriesPosts.sort(
        (a, b) =>
          (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0) ||
          a.data.pubDate.valueOf() - b.data.pubDate.valueOf(),
      ),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getSeriesOf(post: Post): Promise<SeriesInfo | undefined> {
  if (!FEATURES.series || !post.data.series) return undefined;
  const all = await getAllSeries(postLocale(post));
  return all.find((series) => series.slug === post.data.series);
}

export async function getTranslation(post: Post): Promise<Post | undefined> {
  const target = otherLocale(postLocale(post));
  const slug = postSlug(post);
  const posts = await getPublishedPosts(target);
  return posts.find((p) => postSlug(p) === slug);
}
