import type { APIRoute } from "astro";
import { FEATURES } from "@/site.config";
import { rssStylesheet } from "@/lib/rss-stylesheet";

export function getStaticPaths() {
  return FEATURES.styledRss ? [{ params: { style: "pretty-feed" } }] : [];
}

export const GET: APIRoute = () =>
  new Response(rssStylesheet(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
