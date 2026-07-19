import type { APIContext } from "astro";
import { SITE } from "@/site.config";

export function GET(context: APIContext) {
  const sitemapUrl = new URL("sitemap-index.xml", context.site ?? SITE.url);
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl}`, ""].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
