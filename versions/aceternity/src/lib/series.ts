import type { Locale } from "#src/i18n/ui";
import { getPublishedPosts, postLocale, seriesUrl, type Post } from "@/lib/posts";
import { readingTime } from "@/lib/utils";

export { seriesUrl };

export const seriesMeta: Record<
  string,
  { title: Record<Locale, string>; description: Record<Locale, string> }
> = {
  fondations: {
    title: {
      fr: "Les fondations d'un blog rapide",
      en: "Foundations of a fast blog",
    },
    description: {
      fr: "Une serie en trois temps: architecture en ilots, budget de performance et thematisation dark first.",
      en: "A three-part series: islands architecture, a performance budget and dark-first theming.",
    },
  },
};

export function seriesTitle(slug: string, locale: Locale): string {
  return seriesMeta[slug]?.title[locale] ?? slug;
}

export function seriesDescription(slug: string, locale: Locale): string {
  return seriesMeta[slug]?.description[locale] ?? "";
}

export async function getSeriesPosts(
  locale: Locale,
  slug: string,
): Promise<Post[]> {
  const posts = await getPublishedPosts(locale);
  return posts
    .filter((post) => post.data.series === slug)
    .sort(
      (a, b) =>
        (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0) ||
        a.data.pubDate.valueOf() - b.data.pubDate.valueOf() ||
        a.data.title.localeCompare(b.data.title),
    );
}

export interface SeriesContext {
  slug: string;
  title: string;
  posts: Post[];
  position: number;
  total: number;
  previous: Post | undefined;
  next: Post | undefined;
}

export async function getSeriesContext(
  post: Post,
): Promise<SeriesContext | undefined> {
  const slug = post.data.series;
  if (!slug) return undefined;
  const locale = postLocale(post);
  const posts = await getSeriesPosts(locale, slug);
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return undefined;
  return {
    slug,
    title: seriesTitle(slug, locale),
    posts,
    position: index + 1,
    total: posts.length,
    previous: posts[index - 1],
    next: posts[index + 1],
  };
}

export async function getAllSeries(locale: Locale): Promise<string[]> {
  const posts = await getPublishedPosts(locale);
  const slugs = new Set<string>();
  for (const post of posts) {
    if (post.data.series) slugs.add(post.data.series);
  }
  return [...slugs].sort();
}

export function cumulativeReadingTime(posts: Post[]): number {
  return posts.reduce((total, post) => total + readingTime(post.body ?? ""), 0);
}
