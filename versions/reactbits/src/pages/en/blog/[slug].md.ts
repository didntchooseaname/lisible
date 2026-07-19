import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug, type Post } from "@/lib/posts";
import { postToMarkdown } from "@/lib/llms";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("en");
  return posts.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Post;
  return new Response(postToMarkdown(post, "en"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
