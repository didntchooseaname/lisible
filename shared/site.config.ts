import type { PublicVariant } from "./variants";

export type Variant = "_core" | PublicVariant;

/**
 * The demo persona every variant shows in its hero, and the author the metadata
 * credits. Kept in one place so replacing it is a single edit rather than a hunt
 * through each variant's components.
 */
export const DEMO_PROFILE = {
  name: "Alex Morgan",
  handle: "alex",
  slug: "alex-morgan",
  pronouns: { fr: "iel", en: "they/them" },
  role: {
    fr: "Designer développeur et auteur technique",
    en: "Designer, developer and technical writer",
  },
  intro: {
    fr:
      "Je conçois des interfaces de lecture et j'écris sur ce qui les rend rapides: "
      + "architecture en îlots, budget de performance, typographie et accessibilité. "
      + "Ce profil est un gabarit: remplacez-le dans shared/site.config.ts.",
    en:
      "I design reading interfaces and write about what makes them fast: islands "
      + "architecture, performance budgets, typography and accessibility. "
      + "This profile is a template: replace it in shared/site.config.ts.",
  },
} as const;

export const SITE_DEFAULTS = {
  title: "Lisible",
  author: DEMO_PROFILE.name,
  url: "https://blog.example.com",
  accent: "#22C55E",
  postsPerPage: 6,
  featuredCount: 2,
  coverPosition: "down" as "up" | "down",
  social: {
    github: "https://github.com/didntchooseaname/lisible",
    bluesky: `https://bsky.app/profile/${DEMO_PROFILE.handle}.example.com`,
    mastodon: `https://mastodon.social/@${DEMO_PROFILE.handle}`,
    linkedin: `https://www.linkedin.com/in/${DEMO_PROFILE.slug}/`,
    email: "mailto:hello@example.com",
    rss: "/rss.xml",
  },
  framework: {
    name: "Lisible",
    url: "https://github.com/didntchooseaname/lisible",
  },
  repo: {
    url: "" as string,
    branch: "main" as string,
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

/**
 * Single normalised shape every variant consumes, so a component written for one
 * variant keeps working in the others.
 */
export const WEBMENTIONS_CONFIG = {
  domain: INTEGRATIONS.webmentions.domain,
} as const;

export const COMMENTS_CONFIG = {
  provider: INTEGRATIONS.comments.provider,
  giscus: { ...INTEGRATIONS.comments.giscus },
  bluesky: {
    postUri: INTEGRATIONS.comments.bluesky.postUri,
    actor: blueskyActor(),
  },
} as const;

/**
 * Fails the build when a feature flag is on but the integration it needs is not
 * configured, instead of shipping a silently broken widget.
 */
export function assertIntegrationsConfig(features: {
  webmentions: boolean;
  comments: boolean;
}): void {
  const errors: string[] = [];

  if (features.webmentions && !WEBMENTIONS_CONFIG.domain.trim()) {
    errors.push(
      "FEATURES.webmentions is enabled but INTEGRATIONS.webmentions.domain is empty. " +
        "Set the domain verified by webmention.io in shared/site.config.ts, " +
        "or set FEATURES.webmentions to false in shared/features.ts.",
    );
  }

  if (features.comments) {
    if (COMMENTS_CONFIG.provider === "giscus") {
      const missing = (["repo", "repoId", "category", "categoryId"] as const).filter(
        (key) => !String(COMMENTS_CONFIG.giscus[key]).trim(),
      );
      if (missing.length > 0) {
        errors.push(
          "FEATURES.comments is enabled with the giscus provider, but " +
            `INTEGRATIONS.comments.giscus is incomplete (missing: ${missing.join(", ")}). ` +
            "Generate these values at https://giscus.app and add them to " +
            "shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    } else if (COMMENTS_CONFIG.provider === "bluesky") {
      if (!COMMENTS_CONFIG.bluesky.postUri.trim()) {
        errors.push(
          "FEATURES.comments is enabled with the bluesky provider, but " +
            "INTEGRATIONS.comments.bluesky.postUri is empty. Set the root post at:// URI " +
            "in shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    } else {
      errors.push(
        `Invalid INTEGRATIONS.comments.provider: "${COMMENTS_CONFIG.provider}". ` +
          'Accepted values: "giscus" or "bluesky".',
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      "\n[Lisible] Incomplete integration configuration:\n\n" +
        errors.map((message) => `  - ${message}`).join("\n\n") +
        "\n",
    );
  }
}
