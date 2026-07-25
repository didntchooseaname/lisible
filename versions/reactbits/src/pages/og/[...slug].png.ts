import { ogImageRoute } from "@shared/lib/og-route";
import { FEATURES, SITE } from "@/site.config";
import { locales } from "@/i18n/ui";

export const { getStaticPaths, GET } = ogImageRoute({
  enabled: FEATURES.ogPerPost,
  locales,
  theme: {
    accent: SITE.accent,
    background: "#050505",
    foreground: "#fafafa",
    muted: "#a3a3a3",
    siteTitle: SITE.title,
  },
});
