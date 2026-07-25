import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import type { Locale } from "./format";
import { getPublishedPosts, type Post } from "./posts";

/** Path the feeds point at; the stylesheet route emits it for every variant. */
export const RSS_STYLESHEET_PATH = "/rss/feed.xsl";

/**
 * Builds one locale's feed. The stylesheet is locale-agnostic: it branches on
 * `channel/language`, so both feeds share a single generated file.
 */
export async function localeRss(
  context: APIContext,
  locale: Locale,
  options: {
    title: string;
    description: string;
    siteUrl: string;
    styled: boolean;
    postUrl: (post: Post) => string;
  },
) {
  const posts = await getPublishedPosts(locale);
  return rss({
    title: options.title,
    description: options.description,
    site: context.site ?? options.siteUrl,
    stylesheet: options.styled ? RSS_STYLESHEET_PATH : undefined,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: options.postUrl(post),
    })),
    customData: `<language>${locale}</language>`,
  });
}
