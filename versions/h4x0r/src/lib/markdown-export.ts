import { SITE } from "#src/site.config";
import { t, locales, type Locale } from "#src/i18n/ui";
import { getPublishedPosts, postLocale, postSlug, postUrl, type Post } from "@/lib/posts";
import { isoDate } from "@/lib/utils";

export function postMarkdownPath(post: Post): string {
  const locale = postLocale(post);
  const prefix = locale === "fr" ? "" : "/en";
  return `${prefix}/blog/${postSlug(post)}.md`;
}

export function postMarkdown(post: Post): string {
  const locale = postLocale(post);
  const lines = [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    `- Date: ${isoDate(post.data.pubDate)}`,
  ];
  if (post.data.updatedDate) {
    lines.push(`- Updated: ${isoDate(post.data.updatedDate)}`);
  }
  if (post.data.tags.length > 0) {
    lines.push(`- Tags: ${post.data.tags.join(", ")}`);
  }
  lines.push(
    `- Language: ${locale}`,
    `- URL: ${new URL(postUrl(post), SITE.url).toString()}`,
    "",
    "---",
    "",
    (post.body ?? "").trim(),
    "",
  );
  return lines.join("\n");
}

export async function llmsIndex(): Promise<string> {
  const sections: string[] = [
    `# ${SITE.title}`,
    "",
    `> ${t("fr").site.tagline}`,
    `> ${t("en").site.tagline}`,
    "",
    "This file lists the Markdown versions of every published post.",
    `The complete content is available at ${new URL("/llms-full.txt", SITE.url).toString()}.`,
    "",
  ];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    sections.push(`## Blog (${locale})`, "");
    for (const post of posts) {
      const mdUrl = new URL(postMarkdownPath(post), SITE.url).toString();
      sections.push(`- [${post.data.title}](${mdUrl}): ${post.data.description}`);
    }
    sections.push("");
  }
  return sections.join("\n");
}

export async function llmsFull(): Promise<string> {
  const sections: string[] = [
    `# ${SITE.title} (full content)`,
    "",
    `> ${t("fr").site.tagline}`,
    "",
  ];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      sections.push("---", "", postMarkdown(post).trim(), "");
    }
  }
  return sections.join("\n");
}
