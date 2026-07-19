import type { APIContext } from "astro";
import { FEATURES } from "@/site.config";
import { locales } from "@/i18n/ui";
import { getPublishedPosts, postLocale, postSlug } from "@/lib/posts";
import { renderOgImage } from "@/lib/og";

export async function getStaticPaths() {
  if (!FEATURES.ogPerPost) return [];
  const paths = [];
  for (const locale of locales) {
    for (const post of await getPublishedPosts(locale)) {
      paths.push({
        params: { locale, slug: postSlug(post) },
        props: { post },
      });
    }
  }
  return paths;
}

export async function GET({ props }: APIContext) {
  const { post } = props;
  const png = await renderOgImage({
    title: post.data.title,
    description: post.data.description,
    locale: postLocale(post),
    slug: postSlug(post),
  });
  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
}
