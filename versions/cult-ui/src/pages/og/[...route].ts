import { OGImageRoute } from "astro-og-canvas";
import { FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug } from "@/lib/posts";
import { locales } from "@/i18n/ui";
import { ogImageOptions, type OgPageData } from "@/lib/og";

const pages: Record<string, OgPageData> = {};

if (FEATURES.ogPerPost) {
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      pages[`${locale}/${postSlug(post)}`] = {
        title: post.data.title,
        description: post.data.description,
      };
    }
  }
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getSlug: (path) => `${path}.png`,
  getImageOptions: (_path, page: OgPageData) =>
    ogImageOptions(page.title, page.description),
});
