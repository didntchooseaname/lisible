import type { APIContext } from "astro";
import { FEATURES } from "@/site.config";
import { locales, type Locale } from "@/i18n/ui";
import { rssStylesheet } from "@/lib/rss-xsl";

export function getStaticPaths() {
  if (!FEATURES.styledRss) return [];
  return locales.map((locale) => ({ params: { xsl: `${locale}.xsl` } }));
}

export function GET({ params }: APIContext) {
  const locale = (params.xsl ?? "fr.xsl").replace(".xsl", "") as Locale;
  return new Response(rssStylesheet(locale), {
    headers: { "Content-Type": "text/xsl; charset=utf-8" },
  });
}
