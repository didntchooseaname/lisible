import { SHARED_FEATURES } from "#shared/features";
import { blueskyActor, INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("h4x0r");
export const FEATURES = SHARED_FEATURES;
export type Features = typeof FEATURES;

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
    handle: blueskyActor(),
  },
} as const;
