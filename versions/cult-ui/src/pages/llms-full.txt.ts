import type { APIRoute } from "astro";
import { FEATURES } from "@/site.config";
import { buildLlmsFullTxt } from "@/lib/llms";

export const GET: APIRoute = async () => {
  if (!FEATURES.llmsTxt) return new Response(null, { status: 404 });
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
