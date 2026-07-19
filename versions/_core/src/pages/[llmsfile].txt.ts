import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES, SITE } from "@/site.config";
import { buildLlmsIndex, buildLlmsFull } from "@/lib/llms";

export const getStaticPaths: GetStaticPaths = () => {
  if (!FEATURES.llmsTxt) return [];
  return [{ params: { llmsfile: "llms" } }, { params: { llmsfile: "llms-full" } }];
};

export const GET: APIRoute = async ({ params, site }) => {
  const base = site ?? SITE.url;
  const body =
    params.llmsfile === "llms-full"
      ? await buildLlmsFull(base)
      : await buildLlmsIndex(base);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
