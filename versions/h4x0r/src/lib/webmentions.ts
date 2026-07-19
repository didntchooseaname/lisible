import { WEBMENTIONS } from "#src/site.config";

export interface WebmentionAuthor {
  name: string;
  photo: string;
  url: string;
}

export interface Webmention {
  type: "like-of" | "repost-of" | "mention-of" | "in-reply-to";
  author: WebmentionAuthor;
  url: string;
  published: string | null;
  text: string;
}

export interface WebmentionSummary {
  likes: number;
  reposts: number;
  mentions: Webmention[];
}

interface Jf2Entry {
  "wm-property"?: string;
  author?: { name?: string; photo?: string; url?: string };
  url?: string;
  published?: string | null;
  content?: { text?: string };
}

export async function getWebmentions(path: string): Promise<WebmentionSummary> {
  const empty: WebmentionSummary = { likes: 0, reposts: 0, mentions: [] };
  if (!WEBMENTIONS.domain) return empty;
  const target = new URL(path, `https://${WEBMENTIONS.domain}`).toString();
  try {
    const api = new URL("https://webmention.io/api/mentions.jf2");
    api.searchParams.set("target", target);
    api.searchParams.set("per-page", "200");
    const response = await fetch(api, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return empty;
    const data = (await response.json()) as { children?: Jf2Entry[] };
    const entries = data.children ?? [];
    const summary: WebmentionSummary = { likes: 0, reposts: 0, mentions: [] };
    for (const entry of entries) {
      const property = entry["wm-property"];
      if (property === "like-of") summary.likes += 1;
      else if (property === "repost-of") summary.reposts += 1;
      else if (property === "mention-of" || property === "in-reply-to") {
        summary.mentions.push({
          type: property,
          author: {
            name: entry.author?.name ?? "?",
            photo: entry.author?.photo ?? "",
            url: entry.author?.url ?? entry.url ?? "",
          },
          url: entry.url ?? "",
          published: entry.published ?? null,
          text: entry.content?.text ?? "",
        });
      }
    }
    return summary;
  } catch {
    return empty;
  }
}
