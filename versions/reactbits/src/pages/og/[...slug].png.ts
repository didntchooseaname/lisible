import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES } from "@/site.config";
import {
  getAllPublishedPosts,
  postLocale,
  postSlug,
  type Post,
} from "@/lib/posts";
import { renderOgImage } from "@/lib/og";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!FEATURES.ogPerPost) return [];
  const posts = await getAllPublishedPosts();
  return posts.map((post) => ({
    params: { slug: `${postLocale(post)}/${postSlug(post)}` },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Post;
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
