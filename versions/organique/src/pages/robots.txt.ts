import type { APIContext } from "astro";
import { FEATURES, SITE } from "@/site.config";

export function GET(context: APIContext) {
  const base = context.site ?? SITE.url;
  const sitemapUrl = new URL("sitemap-index.xml", base);
  const lines = ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl}`];
  if (FEATURES.llmsTxt) {
    // Comment lines: robots.txt has no official directive for llms.txt, so
    // the pointer is informative without confusing strict parsers.
    lines.push(
      `# llms: ${new URL("llms.txt", base)}`,
      `# llms-full: ${new URL("llms-full.txt", base)}`,
    );
  }
  lines.push("");
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
