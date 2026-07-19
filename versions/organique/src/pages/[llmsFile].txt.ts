import type { APIRoute, GetStaticPaths } from "astro";
import { FEATURES, SITE } from "@/site.config";
import { getPublishedPosts, postSlug } from "@/lib/posts";
import { postToMarkdown } from "@/lib/markdown-export";
import { locales, t } from "@/i18n/ui";

export const getStaticPaths: GetStaticPaths = () => {
  if (!FEATURES.llmsTxt) return [];
  return [{ params: { llmsFile: "llms" } }, { params: { llmsFile: "llms-full" } }];
};

async function buildIndex(base: string): Promise<string> {
  const lines: string[] = [`# ${SITE.title}`, "", `> ${t("fr").site.tagline}`, ""];
  lines.push(t("fr").site.description, "");

  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    const heading = locale === "fr" ? "Articles (FR)" : "Articles (EN)";
    lines.push(`## ${heading}`, "");
    for (const post of posts) {
      const mdBase = locale === "fr" ? "blog" : "en/blog";
      const url = new URL(`/${mdBase}/${postSlug(post)}.md`, base).toString();
      lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function buildFull(base: string): Promise<string> {
  const blocks: string[] = [`# ${SITE.title}`, "", `> ${t("fr").site.tagline}`, ""];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      blocks.push(postToMarkdown(post, base));
      blocks.push("", "---", "");
    }
  }
  return blocks.join("\n");
}

export const GET: APIRoute = async ({ params, site }) => {
  const base = site?.toString() ?? SITE.url;
  const body = params.llmsFile === "llms-full" ? await buildFull(base) : await buildIndex(base);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
