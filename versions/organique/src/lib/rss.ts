import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { FEATURES, SITE } from "#src/site.config";
import { t, type Locale } from "#src/i18n/ui";
import { getPublishedPosts, postUrl } from "@/lib/posts";

export async function localeRss(context: APIContext, locale: Locale) {
  const posts = await getPublishedPosts(locale);
  const dict = t(locale);
  const stylesheet = FEATURES.styledRss ? `/rss/pretty-feed.${locale}.xsl` : undefined;
  return rss({
    title: SITE.title,
    description: dict.site.description,
    site: context.site ?? SITE.url,
    stylesheet,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postUrl(post),
    })),
    customData: `<language>${locale}</language>`,
  });
}
