import type { APIContext } from "astro";
import { SITE, FEATURES } from "@/site.config";
import { locales, t } from "@/i18n/ui";
import { getPublishedPosts, postMdPath, postUrl } from "@/lib/posts";
import { postToMarkdown } from "@/lib/markdown-export";

export function getStaticPaths() {
  if (!FEATURES.llmsTxt) return [];
  return [
    { params: { llms: "llms" }, props: { full: false } },
    { params: { llms: "llms-full" }, props: { full: true } },
  ];
}

async function renderIndex(base: string): Promise<string> {
  const lines: string[] = [];
  lines.push(`# ${SITE.title}`);
  lines.push("");
  lines.push(`> ${t("fr").site.tagline}`);
  lines.push("");
  lines.push(t("fr").site.description);
  lines.push("");

  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    if (posts.length === 0) continue;
    lines.push(`## ${locale === "fr" ? "Articles (FR)" : "Posts (EN)"}`);
    lines.push("");
    for (const post of posts) {
      lines.push(`- [${post.data.title}](${base}${postMdPath(post)}): ${post.data.description}`);
    }
    lines.push("");
  }

  lines.push("## llms-full.txt");
  lines.push("");
  lines.push(`- [${SITE.title} (contenu complet)](${base}/llms-full.txt)`);
  lines.push("");

  return lines.join("\n");
}

async function renderFull(base: string): Promise<string> {
  const blocks: string[] = [];
  blocks.push(`# ${SITE.title}`);
  blocks.push("");
  blocks.push(`> ${t("fr").site.tagline}`);
  blocks.push("");

  for (const locale of locales) {
    for (const post of await getPublishedPosts(locale)) {
      const url = `${base}${postUrl(post)}`;
      blocks.push("", "---", "", postToMarkdown(post, url));
    }
  }

  return blocks.join("\n");
}

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(SITE.url)).toString().replace(/\/+$/, "");
  const full = context.props.full as boolean;
  const body = full ? await renderFull(base) : await renderIndex(base);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
