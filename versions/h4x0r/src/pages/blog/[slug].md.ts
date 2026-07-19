import type { APIContext } from "astro";
import { FEATURES } from "@/site.config";
import { getPublishedPosts, postSlug } from "@/lib/posts";
import { postMarkdown } from "@/lib/markdown-export";

export async function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  const posts = await getPublishedPosts("fr");
  return posts.map((post) => ({
    params: { slug: postSlug(post) },
    props: { post },
  }));
}

export function GET({ props }: APIContext) {
  return new Response(postMarkdown(props.post), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
