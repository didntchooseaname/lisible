import { SITE } from "#src/site.config";
import { locales, t, type Locale } from "#src/i18n/ui";
import {
  getPublishedPosts,
  postLocale,
  postMarkdownUrl,
  postUrl,
  type Post,
} from "@/lib/posts";
import { isoDate } from "@/lib/utils";

export function buildPostMarkdown(post: Post): string {
  const locale = postLocale(post);
  const dict = t(locale);
  const lines: string[] = [];
  lines.push(`# ${post.data.title}`, "");
  if (post.data.description) lines.push(`> ${post.data.description}`, "");
  const meta = [`${dict.post.publishedOn} ${isoDate(post.data.pubDate)}`];
  if (post.data.updatedDate) {
    meta.push(`${dict.post.updatedOn} ${isoDate(post.data.updatedDate)}`);
  }
  if (post.data.tags.length > 0) {
    meta.push(post.data.tags.map((tag) => `#${tag}`).join(" "));
  }
  lines.push(meta.join(" · "), "");
  lines.push(new URL(postUrl(post), SITE.url).toString(), "");
  lines.push("---", "");
  lines.push((post.body ?? "").trim(), "");
  return lines.join("\n");
}

export async function buildLlmsIndex(): Promise<string> {
  const lines: string[] = [];
  lines.push(`# ${SITE.title}`, "");
  lines.push(`> ${t("fr").site.tagline}`, "");
  lines.push(
    "Ce fichier suit la convention llms.txt: il liste les articles du site avec un lien vers leur version Markdown brute. Le contenu complet est disponible dans /llms-full.txt.",
    "",
  );
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    if (posts.length === 0) continue;
    const heading = locale === "fr" ? "Articles (français)" : "Posts (English)";
    lines.push(`## ${heading}`, "");
    for (const post of posts) {
      const mdUrl = new URL(postMarkdownUrl(post), SITE.url).toString();
      const desc = post.data.description ? `: ${post.data.description}` : "";
      lines.push(`- [${post.data.title}](${mdUrl})${desc}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function buildLlmsFull(): Promise<string> {
  const lines: string[] = [];
  lines.push(`# ${SITE.title}`, "");
  lines.push(`> ${t("fr").site.tagline}`, "");
  lines.push("");
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      lines.push(buildPostMarkdown(post));
      lines.push("", "===", "");
    }
  }
  return lines.join("\n");
}

export async function markdownPaths(
  locale: Locale,
): Promise<{ params: { slug: string }; props: { markdown: string } }[]> {
  const posts = await getPublishedPosts(locale);
  return posts.map((post) => ({
    params: { slug: post.id.replace(/^(fr|en)\//, "") },
    props: { markdown: buildPostMarkdown(post) },
  }));
}
