import type { APIContext } from "astro";
import { SITE, FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug, postUrl, type Post } from "@/lib/posts";
import { postToMarkdown } from "@/lib/markdown-export";

export async function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("fr");
  return posts.map((post) => ({ params: { slug: postSlug(post) }, props: { post } }));
}

export function GET(context: APIContext) {
  const post = context.props.post as Post;
  const url = new URL(postUrl(post), context.site ?? SITE.url).toString();
  return new Response(postToMarkdown(post, url), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
