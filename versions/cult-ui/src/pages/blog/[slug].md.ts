import type { APIRoute } from "astro";
import { FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug, type Post } from "@/lib/posts";
import { postToMarkdown } from "@/lib/llms";

export async function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("fr");
  return posts.map((post) => ({
    params: { slug: postSlug(post) },
    props: { post },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { post } = props as { post: Post };
  return new Response(postToMarkdown(post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
