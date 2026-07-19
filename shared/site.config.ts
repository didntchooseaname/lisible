import type { PublicVariant } from "./variants";

export type Variant = "_core" | PublicVariant;

export const SITE_DEFAULTS = {
  title: "Lisible",
  author: "Lisible",
  url: "https://blog.example.com",
  accent: "#22C55E",
  postsPerPage: 6,
  featuredCount: 2,
  coverPosition: "down" as "up" | "down",
  social: {
    github: "https://github.com/didntchooseaname/lisible",
    bluesky: "https://bsky.app/profile/alice.example.com",
    mastodon: "https://mastodon.social/@alice",
    linkedin: "https://www.linkedin.com/in/alice-example/",
    email: "mailto:hello@example.com",
    rss: "/rss.xml",
  },
  framework: {
    name: "Lisible",
    url: "https://github.com/didntchooseaname/lisible",
  },
  repo: {
    url: "",
    branch: "main",
  },
} as const;

export const INTEGRATIONS = {
  // The shipped site uses local demo placeholders. Replace these empty values,
  // then enable the matching flag in shared/features.ts for live integrations.
  webmentions: {
    domain: "",
  },
  comments: {
    provider: "giscus" as "giscus" | "bluesky",
    giscus: {
      repo: "" as `${string}/${string}` | "",
      repoId: "",
      category: "",
      categoryId: "",
      mapping: "pathname" as "pathname" | "url" | "title" | "og:title",
    },
    bluesky: {
      postUri: "",
    },
  },
} as const;

export function siteForVariant(variant: Variant) {
  return {
    ...SITE_DEFAULTS,
    repo: {
      ...SITE_DEFAULTS.repo,
      contentBase: `versions/${variant}`,
    },
  } as const;
}

export function blueskyActor(
  postUri = INTEGRATIONS.comments.bluesky.postUri,
): string {
  return postUri.replace(/^at:\/\//, "").split("/")[0] ?? "";
}
