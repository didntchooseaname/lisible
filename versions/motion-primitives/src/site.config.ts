import { SHARED_FEATURES } from "#shared/features";
import { INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("motion-primitives");
export const FEATURES = SHARED_FEATURES;

export type Features = typeof FEATURES;

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

export type Webmentions = typeof WEBMENTIONS;
export type Comments = typeof COMMENTS;
