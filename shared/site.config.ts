import { CONFIG, PROFILE } from "./config";
import type { PublicVariant } from "./variants";

export type Variant = "_core" | PublicVariant;

/**
 * The demo persona every variant shows in its hero, and the author the metadata
 * credits. The name, handle and slug follow site.author in lisible.config.json;
 * the descriptive texts are defined in shared/config.ts.
 */
export const DEMO_PROFILE = PROFILE;

export const SITE_DEFAULTS = {
  title: CONFIG.site.title,
  author: PROFILE.name,
  url: CONFIG.site.url,
  accent: CONFIG.site.accent,
  postsPerPage: CONFIG.site.postsPerPage,
  featuredCount: CONFIG.site.featuredCount,
  coverPosition: CONFIG.site.coverPosition,
  social: {
    ...CONFIG.social,
    rss: "/rss.xml",
  },
  framework: {
    name: "Lisible",
    url: "https://github.com/didntchooseaname/lisible",
  },
  repo: {
    url: CONFIG.repo.url,
    branch: CONFIG.repo.branch,
  },
} as const;

export const INTEGRATIONS = CONFIG.integrations;

export function siteForVariant(variant: Variant) {
  return {
    ...SITE_DEFAULTS,
    repo: {
      ...SITE_DEFAULTS.repo,
      contentBase: `versions/${variant}`,
    },
  } as const;
}

export function blueskyActor(postUri = INTEGRATIONS.comments.bluesky.postUri): string {
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
      "features.webmentions is enabled but integrations.webmentions.domain is empty. " +
        "Set the domain verified by webmention.io in lisible.config.json, " +
        "or set features.webmentions to false.",
    );
  }

  if (features.comments) {
    if (COMMENTS_CONFIG.provider === "giscus") {
      const missing = (["repo", "repoId", "category", "categoryId"] as const).filter(
        (key) => !String(COMMENTS_CONFIG.giscus[key]).trim(),
      );
      if (missing.length > 0) {
        errors.push(
          "features.comments is enabled with the giscus provider, but " +
            `integrations.comments.giscus is incomplete (missing: ${missing.join(", ")}). ` +
            "Generate these values at https://giscus.app and add them to " +
            "lisible.config.json, or set features.comments to false.",
        );
      }
    } else if (COMMENTS_CONFIG.provider === "bluesky") {
      if (!COMMENTS_CONFIG.bluesky.postUri.trim()) {
        errors.push(
          "features.comments is enabled with the bluesky provider, but " +
            "integrations.comments.bluesky.postUri is empty. Set the root post at:// URI " +
            "in lisible.config.json, or set features.comments to false.",
        );
      }
    } else {
      errors.push(
        `Invalid integrations.comments.provider: "${COMMENTS_CONFIG.provider}". ` +
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
