import { FEATURES, WEBMENTIONS, COMMENTS } from "#src/site.config";

if (FEATURES.webmentions && !WEBMENTIONS.domain) {
  throw new Error(
    "[wave2] FEATURES.webmentions is enabled but WEBMENTIONS.domain is empty. " +
      "Set the domain registered with webmention.io in shared/site.config.ts " +
      "(for example: WEBMENTIONS = { domain: \"example.com\" }), or disable the feature flag.",
  );
}

if (FEATURES.comments) {
  if (COMMENTS.provider === "giscus") {
    const missing = (
      ["repo", "repoId", "category", "categoryId"] as const
    ).filter((key) => !COMMENTS[key]);
    if (missing.length > 0) {
      throw new Error(
        "[wave2] FEATURES.comments (giscus provider) is enabled but its configuration is " +
          `incomplete. Missing COMMENTS fields: ${missing.join(", ")}. ` +
          "Get these values from https://giscus.app and add them to shared/site.config.ts, " +
          "or disable the feature flag.",
      );
    }
  } else if (COMMENTS.provider === "bluesky") {
    if (!COMMENTS.postUri) {
      throw new Error(
        "[wave2] FEATURES.comments (bluesky provider) is enabled but COMMENTS.postUri " +
          "is empty. Set the root Bluesky post URI in shared/site.config.ts, " +
          "or disable the feature flag.",
      );
    }
  } else {
    throw new Error(
      `[wave2] Invalid COMMENTS.provider: "${COMMENTS.provider}". ` +
        'Accepted values: "giscus" or "bluesky".',
    );
  }
}

export {};
