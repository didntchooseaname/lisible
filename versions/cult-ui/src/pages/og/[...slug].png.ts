import { ogImageRoute } from "@shared/lib/og-route";
import { locales } from "@/i18n/ui";
import { FEATURES, SITE } from "@/site.config";

export const { getStaticPaths, GET } = ogImageRoute({
  enabled: FEATURES.ogPerPost,
  locales,
  theme: {
    accent: SITE.accent,
    background: "#0a0a0a",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    siteTitle: SITE.title,
  },
});
