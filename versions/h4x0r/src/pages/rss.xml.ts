import type { APIContext } from "astro";
import { localeRss } from "@/lib/rss";

export function GET(context: APIContext) {
  return localeRss(context, "fr");
}
