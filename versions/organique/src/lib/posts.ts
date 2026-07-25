import { localeUrl, type Locale } from "@/i18n/ui";
import { postLocale, postSlug, type Post } from "@shared/lib/posts";

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

/** URL building stays per variant: only the variant knows its routing helpers. */
export function postUrl(post: Post): string {
  return localeUrl(postLocale(post), `blog/${postSlug(post)}`);
}

export function seriesUrl(locale: Locale, slug: string): string {
  return localeUrl(locale, `series/${slug}`);
}
