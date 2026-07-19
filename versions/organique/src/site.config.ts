import { SHARED_FEATURES } from "#shared/features";
import { INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("organique");
export const FEATURES = SHARED_FEATURES;

export const WEBMENTIONS = {
  domain: INTEGRATIONS.webmentions.domain,
} as const;

export const COMMENTS = {
  provider: INTEGRATIONS.comments.provider,
  giscus: {
    repo: INTEGRATIONS.comments.giscus.repo,
    repoId: INTEGRATIONS.comments.giscus.repoId,
    category: INTEGRATIONS.comments.giscus.category,
    categoryId: INTEGRATIONS.comments.giscus.categoryId,
  },
  bluesky: {
    postUri: INTEGRATIONS.comments.bluesky.postUri,
  },
} as const;

export function validateFeatureConfig(): void {
  if (FEATURES.webmentions && !WEBMENTIONS.domain) {
    throw new Error(
      "[Lisible] FEATURES.webmentions is enabled but WEBMENTIONS.domain is empty. " +
        "Set the domain verified by webmention.io in shared/site.config.ts, " +
        "or set FEATURES.webmentions to false.",
    );
  }
  if (FEATURES.comments) {
    if (COMMENTS.provider === "giscus") {
      const g = COMMENTS.giscus;
      if (!g.repo || !g.repoId || !g.category || !g.categoryId) {
        throw new Error(
          "[Lisible] FEATURES.comments is enabled (giscus provider), but " +
            "COMMENTS.giscus is incomplete. Set repo, repoId, category, and " +
            "categoryId in shared/site.config.ts (see https://giscus.app), " +
            "or set FEATURES.comments to false.",
        );
      }
    } else if (COMMENTS.provider === "bluesky") {
      if (!COMMENTS.bluesky.postUri) {
        throw new Error(
          "[Lisible] FEATURES.comments is enabled (bluesky provider), but " +
            "COMMENTS.bluesky.postUri is empty. Set the root post URL " +
            "in shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    }
  }
}

validateFeatureConfig();
