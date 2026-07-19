import type { APIRoute } from "astro";
import { FEATURES, SITE } from "@/site.config";
import { allArticleParams, articleMarkdown } from "@/lib/llms";
import type { Post } from "@/lib/posts";

export async function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  const params = await allArticleParams();
  return params
    .filter((p) => p.locale === "en")
    .map((p) => ({ params: { slug: p.slug }, props: { post: p.post } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Post };
  return new Response(articleMarkdown(post, site ?? SITE.url), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
