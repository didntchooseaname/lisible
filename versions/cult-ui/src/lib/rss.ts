import type { APIContext } from "astro";
import { localeRss as sharedLocaleRss } from "@shared/lib/rss";
import { FEATURES, SITE } from "@/site.config";
import { t, type Locale } from "@/i18n/ui";
import { postUrl } from "@/lib/posts";

export function localeRss(context: APIContext, locale: Locale) {
  return sharedLocaleRss(context, locale, {
    title: SITE.title,
    description: t(locale).site.description,
    siteUrl: SITE.url,
    styled: FEATURES.styledRss,
    postUrl,
  });
}
