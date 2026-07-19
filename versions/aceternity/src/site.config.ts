import { SHARED_FEATURES } from "#shared/features";
import { INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("aceternity");
export const FEATURES = SHARED_FEATURES;

export const WEBMENTIONS = {
  domain: INTEGRATIONS.webmentions.domain,
} as const;

export const COMMENTS = {
  provider: INTEGRATIONS.comments.provider,
  repo: INTEGRATIONS.comments.giscus.repo,
  repoId: INTEGRATIONS.comments.giscus.repoId,
  category: INTEGRATIONS.comments.giscus.category,
  categoryId: INTEGRATIONS.comments.giscus.categoryId,
  postUri: INTEGRATIONS.comments.bluesky.postUri,
} as const;

export type Features = typeof FEATURES;
