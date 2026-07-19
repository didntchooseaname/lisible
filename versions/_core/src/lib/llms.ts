import { SITE } from "#src/site.config";
import { t, locales, type Locale } from "#src/i18n/ui";
import { getPublishedPosts, postSlug, postUrl, type Post } from "@/lib/posts";
import { isoDate } from "@/lib/utils";

function cleanBody(body: string): string {
  return body
    .replace(/^import\s.+$/gm, "")
    .replace(/^export\s.+$/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function articleMarkdownUrl(post: Post, base: string | URL): string {
  return new URL(`${postUrl(post).replace(/\/$/, "")}.md`, base).toString();
}

export function articleMarkdown(post: Post, base: string | URL): string {
  const canonical = new URL(postUrl(post), base).toString();
  const lines = [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    `- Source: ${canonical}`,
    `- ${isoDate(post.data.pubDate)}${post.data.tags.length ? ` | ${post.data.tags.join(", ")}` : ""}`,
    "",
    "---",
    "",
    cleanBody(post.body ?? ""),
    "",
  ];
  return lines.join("\n");
}

const groupTitle: Record<Locale, string> = {
  fr: "Articles (français)",
  en: "Posts (English)",
};

export async function buildLlmsIndex(base: string | URL): Promise<string> {
  const dict = t("fr");
  const out: string[] = [
    `# ${SITE.title}`,
    "",
    `> ${dict.site.tagline}`,
    "",
    dict.site.description,
    "",
  ];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    if (posts.length === 0) continue;
    out.push(`## ${groupTitle[locale]}`, "");
    for (const post of posts) {
      out.push(
        `- [${post.data.title}](${articleMarkdownUrl(post, base)}): ${post.data.description}`,
      );
    }
    out.push("");
  }
  return out.join("\n");
}

export async function buildLlmsFull(base: string | URL): Promise<string> {
  const out: string[] = [
    `# ${SITE.title}`,
    "",
    `> ${t("fr").site.tagline}`,
    "",
  ];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      out.push(articleMarkdown(post, base), "", "---", "");
    }
  }
  return out.join("\n");
}

export async function allArticleParams(): Promise<
  { locale: Locale; slug: string; post: Post }[]
> {
  const params: { locale: Locale; slug: string; post: Post }[] = [];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: postSlug(post), post });
    }
  }
  return params;
}
