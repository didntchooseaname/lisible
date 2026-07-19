import { SHARED_FEATURES } from "#shared/features";
import { INTEGRATIONS, siteForVariant } from "#shared/site.config";

export const SITE = siteForVariant("cult-ui");
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
