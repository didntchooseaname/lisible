import { SITE } from "#src/site.config";
import { postLocale, postSlug, postUrl, type Post } from "@/lib/posts";
import { isoDate } from "@/lib/utils";
import { t } from "#src/i18n/ui";

export function postAbsoluteUrl(post: Post, siteUrl: string = SITE.url): string {
  return new URL(postUrl(post), siteUrl).toString();
}

export function postMarkdownUrl(post: Post, siteUrl: string = SITE.url): string {
  const locale = postLocale(post);
  const base = locale === "fr" ? "blog" : "en/blog";
  return new URL(`/${base}/${postSlug(post)}.md`, siteUrl).toString();
}

export function postToMarkdown(post: Post, siteUrl: string = SITE.url): string {
  const locale = postLocale(post);
  const dict = t(locale);
  const { title, description, pubDate, updatedDate, tags } = post.data;

  const meta: string[] = [`${dict.post.publishedOn} ${isoDate(pubDate)}`];
  if (updatedDate) meta.push(`${dict.post.updatedOn} ${isoDate(updatedDate)}`);
  if (tags.length > 0) meta.push(`${dict.post.tags}: ${tags.join(", ")}`);

  return [
    `# ${title}`,
    "",
    `> ${description}`,
    "",
    meta.join(" | "),
    "",
    `${SITE.url ? postAbsoluteUrl(post, siteUrl) : postUrl(post)}`,
    "",
    "---",
    "",
    (post.body ?? "").trim(),
    "",
  ].join("\n");
}
