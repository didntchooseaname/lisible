import type { APIRoute } from "astro";
import { postToMarkdown } from "@shared/lib/llms";
import { FEATURES, SITE } from "@/site.config";
import { getPublishedPosts, postSlug, postUrl, type Post } from "@/lib/posts";

export async function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("fr");
  return posts.map((post) => ({
    params: { slug: postSlug(post) },
    props: { post },
  }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Post };
  const base = site?.toString() ?? SITE.url;
  return new Response(postToMarkdown(post, base, postUrl(post)), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
