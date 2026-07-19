import { SITE } from "#src/site.config";
import { locales, type Locale } from "#src/i18n/ui";
import {
  getPublishedPosts,
  postLocale,
  postSlug,
  postUrl,
  type Post,
} from "@/lib/posts";
import { isoDate } from "@/lib/utils";


export function markdownPath(post: Post): string {
  const locale = postLocale(post);
  const prefix = locale === "fr" ? "" : `/${locale}`;
  return `${prefix}/blog/${postSlug(post)}.md`;
}

export function postToMarkdown(post: Post): string {
  const { title, description, pubDate, updatedDate, tags } = post.data;
  const locale = postLocale(post);
  const labels = locale === "fr"
    ? { date: "Date", updated: "Mise à jour", tags: "Tags" }
    : { date: "Date", updated: "Updated", tags: "Tags" };
  const lines = [`# ${title}`, "", `> ${description}`, ""];
  const meta = [`${labels.date}: ${isoDate(pubDate)}`];
  if (updatedDate) meta.push(`${labels.updated}: ${isoDate(updatedDate)}`);
  if (tags.length > 0) meta.push(`${labels.tags}: ${tags.join(", ")}`);
  meta.push(`URL: ${new URL(postUrl(post), SITE.url).toString()}`);
  lines.push(meta.join("\n"), "", "---", "", (post.body ?? "").trim(), "");
  return lines.join("\n");
}

export async function buildLlmsTxt(): Promise<string> {
  const sections: string[] = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.author} - blog technique statique, bilingue (français / anglais).`,
    "",
    "Chaque article dispose d'une version Markdown propre à l'URL indiquée.",
    "",
  ];
  const labels: Record<Locale, string> = {
    fr: "Articles (français)",
    en: "Posts (English)",
  };
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    if (posts.length === 0) continue;
    sections.push(`## ${labels[locale]}`, "");
    for (const post of posts) {
      const url = new URL(markdownPath(post), SITE.url).toString();
      sections.push(`- [${post.data.title}](${url}): ${post.data.description}`);
    }
    sections.push("");
  }
  return sections.join("\n");
}

export async function buildLlmsFullTxt(): Promise<string> {
  const parts: string[] = [
    `# ${SITE.title}`,
    "",
    `> Corpus complet des articles publiés (${SITE.url}).`,
    "",
  ];
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      parts.push(postToMarkdown(post), "", "===", "");
    }
  }
  return parts.join("\n");
}
