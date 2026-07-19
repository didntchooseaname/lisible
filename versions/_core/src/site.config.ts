import { SHARED_FEATURES } from "#shared/features";
import { INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("_core");
export const FEATURES = SHARED_FEATURES;

export const WEBMENTIONS = {
  domain: INTEGRATIONS.webmentions.domain,
} as const;

export const COMMENTS = {
  provider: INTEGRATIONS.comments.provider,
  giscus: {
    ...INTEGRATIONS.comments.giscus,
  },
  bluesky: {
    postUri: INTEGRATIONS.comments.bluesky.postUri,
  },
} as const;

export const hasRepo = SITE.repo.url.length > 0;

export const hasGithub = SITE.social.github.length > 0;

export function assertFeatureConfig(): void {
  if (FEATURES.webmentions && WEBMENTIONS.domain.length === 0) {
    throw new Error(
      "[Lisible] FEATURES.webmentions is enabled but WEBMENTIONS.domain is empty. " +
        "Set the domain registered with webmention.io in shared/site.config.ts, " +
        "or set FEATURES.webmentions to false.",
    );
  }
  if (FEATURES.comments) {
    if (COMMENTS.provider === "giscus") {
      const g = COMMENTS.giscus;
      if (!g.repo || !g.repoId || !g.category || !g.categoryId) {
        throw new Error(
          "[Lisible] FEATURES.comments is enabled (giscus provider), but its configuration is incomplete. " +
            "Set COMMENTS.giscus.repo, repoId, category, and categoryId (see https://giscus.app) " +
            "in shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    } else if (COMMENTS.provider === "bluesky") {
      if (!COMMENTS.bluesky.postUri) {
        throw new Error(
          "[Lisible] FEATURES.comments is enabled (bluesky provider), but COMMENTS.bluesky.postUri is empty. " +
            "Set the Bluesky post at:// URI in shared/site.config.ts, " +
            "or set FEATURES.comments to false.",
        );
      }
    }
  }
}
