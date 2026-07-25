import { type Post, postLocale, postSlug } from "@shared/lib/posts";
import { type Locale, localeUrl } from "@/i18n/ui";

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

/** URL building stays per variant: only the variant knows its routing helpers. */
export function postUrl(post: Post): string {
  return localeUrl(postLocale(post), `blog/${postSlug(post)}`);
}

export function seriesUrl(locale: Locale, slug: string): string {
  return localeUrl(locale, `series/${slug}`);
}
