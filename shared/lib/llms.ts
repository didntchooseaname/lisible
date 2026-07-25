import { getPublishedPosts, postLocale, postSlug, type Post } from "./posts";
import { isoDate, type Locale } from "./format";

/**
 * Builds `/llms.txt` and `/llms-full.txt`, the plain-text index and full corpus
 * language models are pointed at. Both files are locale-agnostic: they list the
 * French and the English articles side by side, each with its own Markdown URL.
 */
export interface LlmsOptions {
  siteTitle: string;
  tagline: string;
  description: string;
  siteUrl: string;
  locales: readonly Locale[];
  /** Absolute URL of a post, used for the human-readable link. */
  postUrl: (post: Post) => string;
}

/** Companion Markdown export of a post, served next to its HTML page. */
export function markdownPath(post: Post): string {
  const locale = postLocale(post);
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return `${prefix}/blog/${postSlug(post)}.md`;
}

export function postToMarkdown(post: Post, siteUrl: string, url: string): string {
  const { title, description, pubDate, updatedDate, tags } = post.data;
  const labels =
    postLocale(post) === "fr"
      ? { date: "Date", updated: "Mise à jour", tags: "Tags" }
      : { date: "Date", updated: "Updated", tags: "Tags" };

  const meta = [`${labels.date}: ${isoDate(pubDate)}`];
  if (updatedDate) meta.push(`${labels.updated}: ${isoDate(updatedDate)}`);
  if (tags.length > 0) meta.push(`${labels.tags}: ${tags.join(", ")}`);
  meta.push(`URL: ${new URL(url, siteUrl).toString()}`);

  return [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    meta.join("\n"),
    "",
    "---",
    "",
    (post.body ?? "").trim(),
    "",
  ].join("\n");
}

export async function buildLlmsIndex(options: LlmsOptions): Promise<string> {
  const lines = [`# ${options.siteTitle}`, "", `> ${options.tagline}`, "", options.description, ""];

  for (const locale of options.locales) {
    const posts = await getPublishedPosts(locale);
    if (posts.length === 0) continue;
    lines.push(`## ${locale === "fr" ? "Articles (FR)" : "Articles (EN)"}`, "");
    for (const post of posts) {
      const url = new URL(markdownPath(post), options.siteUrl).toString();
      lines.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function buildLlmsFull(options: LlmsOptions): Promise<string> {
  const blocks = [`# ${options.siteTitle}`, "", `> ${options.tagline}`, ""];
  for (const locale of options.locales) {
    for (const post of await getPublishedPosts(locale)) {
      blocks.push(postToMarkdown(post, options.siteUrl, options.postUrl(post)), "", "---", "");
    }
  }
  return blocks.join("\n");
}
