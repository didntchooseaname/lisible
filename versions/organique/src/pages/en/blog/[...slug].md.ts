import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES, SITE } from "@/site.config";
import { getPublishedPosts, postSlug, type Post } from "@/lib/posts";
import { postToMarkdown } from "@/lib/markdown-export";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("en");
  return posts.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
};

export const GET: APIRoute = ({ props, site }) => {
  const post = props.post as Post;
  const body = postToMarkdown(post, site?.toString() ?? SITE.url);
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
