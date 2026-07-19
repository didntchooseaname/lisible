import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES } from "@/site.config";
import { markdownPaths } from "@/lib/llms";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!FEATURES.llmsTxt) return [];
  return markdownPaths("fr");
};

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown as string, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
