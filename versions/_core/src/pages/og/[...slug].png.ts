import type { APIRoute } from "astro";
import { FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug, type Post } from "@/lib/posts";
import { renderOgImage } from "@/lib/og";
import { locales } from "@/i18n/ui";

export async function getStaticPaths() {
  if (!FEATURES.ogPerPost) return [];
  const paths = [];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      paths.push({
        params: { slug: `${locale}/${postSlug(post)}` },
        props: { post },
      });
    }
  }
  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post };
  const png = await renderOgImage({
    title: post.data.title,
    description: post.data.description,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
