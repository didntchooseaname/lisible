import { SHARED_FEATURES } from "../../../shared/features";
import {
  assertIntegrationsConfig,
  COMMENTS_CONFIG,
  NEWSLETTER_CONFIG,
  siteForVariant,
  WEBMENTIONS_CONFIG,
} from "../../../shared/site.config";

export const SITE = siteForVariant("h4x0r");
export const FEATURES = SHARED_FEATURES;
export type Features = typeof FEATURES;

export const WEBMENTIONS = WEBMENTIONS_CONFIG;
export const COMMENTS = COMMENTS_CONFIG;
export const NEWSLETTER = NEWSLETTER_CONFIG;

export const hasRepo = SITE.repo.url.length > 0;
export const hasGithub = SITE.social.github.length > 0;

assertIntegrationsConfig(FEATURES);
