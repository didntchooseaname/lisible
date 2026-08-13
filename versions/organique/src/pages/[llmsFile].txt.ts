import { buildLlmsFull, buildLlmsIndex } from "@shared/lib/llms";
import type { APIRoute, GetStaticPaths } from "astro";
import { locales, t } from "@/i18n/ui";
import { postUrl } from "@/lib/posts";
import { FEATURES, SITE } from "@/site.config";

export const getStaticPaths: GetStaticPaths = () =>
  FEATURES.llmsTxt ? [{ params: { llmsFile: "llms" } }, { params: { llmsFile: "llms-full" } }] : [];

export const GET: APIRoute = async ({ params, site }) => {
  const options = {
    siteTitle: SITE.title,
    intro: locales.map((locale) => ({
      locale,
      tagline: t(locale).site.tagline,
      description: t(locale).site.description,
    })),
    siteUrl: site?.toString() ?? SITE.url,
    locales,
    postUrl,
  };
  const body =
    params.llmsFile === "llms-full" ? await buildLlmsFull(options) : await buildLlmsIndex(options);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
