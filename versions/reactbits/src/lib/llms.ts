import { SITE } from "#src/site.config";
import { t, type Locale } from "#src/i18n/ui";
import {
  getPublishedPosts,
  postMarkdownPath,
  postUrl,
  type Post,
} from "@/lib/posts";
import { isoDate } from "@/lib/utils";

function cleanBody(body: string): string {
  return body
    .split("\n")
    .filter((line) => !/^\s*import\s.+from\s/.test(line))
    .join("\n")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function postToMarkdown(post: Post, locale: Locale): string {
  const dict = t(locale);
  const url = new URL(postUrl(post), SITE.url).toString();
  const lines = [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    `${dict.post.publishedOn} ${isoDate(post.data.pubDate)} · ${SITE.title}`,
    `${url}`,
    "",
    "---",
    "",
    cleanBody(post.body ?? ""),
    "",
  ];
  return lines.join("\n");
}

export async function buildLlmsIndex(): Promise<string> {
  const sections: string[] = [`# ${SITE.title}`, ""];
  for (const locale of ["fr", "en"] as Locale[]) {
    const dict = t(locale);
    if (locale === "fr") {
      sections.push(`> ${dict.site.tagline}`, "", dict.site.description, "");
    }
    const posts = await getPublishedPosts(locale);
    sections.push(`## ${locale === "fr" ? "Articles (FR)" : "Posts (EN)"}`, "");
    for (const post of posts) {
      const mdUrl = new URL(postMarkdownPath(post), SITE.url).toString();
      sections.push(`- [${post.data.title}](${mdUrl}): ${post.data.description}`);
    }
    sections.push("");
  }
  return sections.join("\n");
}

export async function buildLlmsFull(): Promise<string> {
  const parts: string[] = [`# ${SITE.title}`, "", t("fr").site.description, ""];
  for (const locale of ["fr", "en"] as Locale[]) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      parts.push(postToMarkdown(post, locale));
      parts.push("", "---", "");
    }
  }
  return parts.join("\n");
}
