import { FEATURES, WEBMENTIONS, COMMENTS } from "#src/site.config";

class ConfigError extends Error {
  constructor(message: string) {
    super(`\n[configuration] ${message}\n`);
    this.name = "ConfigError";
  }
}

export function assertFeatureConfig(): void {
  if (FEATURES.webmentions && !WEBMENTIONS.domain) {
    throw new ConfigError(
      "FEATURES.webmentions est actif mais WEBMENTIONS.domain est vide. " +
        "Renseignez le domaine enregistré sur webmention.io (shared/site.config.ts) " +
        "ou repassez le flag à false.",
    );
  }

  if (FEATURES.comments) {
    if (COMMENTS.provider === "giscus") {
      const g = COMMENTS.giscus;
      const missing = (["repo", "repoId", "category", "categoryId"] as const).filter(
        (key) => !g[key],
      );
      if (missing.length > 0) {
        throw new ConfigError(
          "FEATURES.comments est actif (provider giscus) mais la configuration " +
            `giscus est incomplète: ${missing.join(", ")} manquant(s). ` +
            "Récupérez ces valeurs sur https://giscus.app puis renseignez " +
            "COMMENTS.giscus (shared/site.config.ts), ou repassez le flag à false.",
        );
      }
    } else if (COMMENTS.provider === "bluesky") {
      if (!COMMENTS.bluesky.profile) {
        throw new ConfigError(
          "FEATURES.comments est actif (provider bluesky) mais " +
            "INTEGRATIONS.comments.bluesky.postUri est vide dans shared/site.config.ts. " +
            "Renseignez l’URI at:// du post racine ou repassez le flag à false.",
        );
      }
    }
  }
}
