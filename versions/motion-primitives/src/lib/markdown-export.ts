import { postLocale, type Post } from "@/lib/posts";
import { isoDate } from "@/lib/utils";

export function postToMarkdown(post: Post, url: string): string {
  const locale = postLocale(post);
  const meta: string[] = [
    locale === "fr" ? `Publie le ${isoDate(post.data.pubDate)}` : `Published on ${isoDate(post.data.pubDate)}`,
  ];
  if (post.data.updatedDate) {
    meta.push(
      locale === "fr"
        ? `Mis a jour le ${isoDate(post.data.updatedDate)}`
        : `Updated on ${isoDate(post.data.updatedDate)}`,
    );
  }
  if (post.data.tags.length > 0) {
    meta.push(`Tags: ${post.data.tags.join(", ")}`);
  }
  meta.push(`URL: ${url}`);

  const body = (post.body ?? "").trim();
  return [
    `# ${post.data.title}`,
    "",
    `> ${post.data.description}`,
    "",
    meta.join(" | "),
    "",
    "---",
    "",
    body,
    "",
  ].join("\n");
}
