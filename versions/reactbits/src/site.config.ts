import { SHARED_FEATURES } from "#shared/features";
import { blueskyActor, INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("reactbits");
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
    profile: blueskyActor(),
  },
} as const;

export type Webmentions = typeof WEBMENTIONS;
export type Comments = typeof COMMENTS;
