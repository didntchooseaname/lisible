import type { APIContext } from "astro";
import { FEATURES } from "@/site.config";
import { llmsFull, llmsIndex } from "@/lib/markdown-export";

export function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  return [
    { params: { llmsfile: "llms" } },
    { params: { llmsfile: "llms-full" } },
  ];
}

export async function GET({ params }: APIContext) {
  const body = params.llmsfile === "llms-full" ? await llmsFull() : await llmsIndex();
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
