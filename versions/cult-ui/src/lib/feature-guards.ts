import { FEATURES, WEBMENTIONS, COMMENTS } from "#src/site.config";

export function assertFeatureConfig(): void {
  const errors: string[] = [];

  if (FEATURES.webmentions && !WEBMENTIONS.domain.trim()) {
    errors.push(
      "FEATURES.webmentions is enabled but WEBMENTIONS.domain is empty. " +
        "Set the domain verified by webmention.io in shared/site.config.ts " +
        '(for example, domain: "blog.example.com"), or set FEATURES.webmentions to false.',
    );
  }

  if (FEATURES.comments) {
    if (COMMENTS.provider === "giscus") {
      const g = COMMENTS.giscus;
      const missing = (
        [
          ["repo", g.repo],
          ["repoId", g.repoId],
          ["category", g.category],
          ["categoryId", g.categoryId],
        ] as const
      )
        .filter(([, value]) => !String(value).trim())
        .map(([key]) => key);
      if (missing.length > 0) {
        errors.push(
          "FEATURES.comments is enabled with the giscus provider, but " +
            `COMMENTS.giscus is incomplete (missing: ${missing.join(", ")}). ` +
            "Generate these values at https://giscus.app and add them to " +
            "shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    } else if (COMMENTS.provider === "bluesky") {
      if (!COMMENTS.bluesky.postUri.trim()) {
        errors.push(
          "FEATURES.comments is enabled with the bluesky provider, but " +
            "COMMENTS.bluesky.postUri is empty. Set the root post at:// URI " +
            "in shared/site.config.ts, or set FEATURES.comments to false.",
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      "\n[Lisible] Incomplete feature configuration:\n\n" +
        errors.map((message) => `  - ${message}`).join("\n\n") +
        "\n",
    );
  }
}
