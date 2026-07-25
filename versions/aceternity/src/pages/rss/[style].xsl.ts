import { rssStylesheet } from "@shared/lib/rss-stylesheet";
import type { APIRoute } from "astro";
import { FEATURES, SITE } from "@/site.config";

export function getStaticPaths() {
  return FEATURES.styledRss ? [{ params: { style: "feed" } }] : [];
}

export const GET: APIRoute = () =>
  new Response(rssStylesheet(SITE.title, SITE.accent), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
