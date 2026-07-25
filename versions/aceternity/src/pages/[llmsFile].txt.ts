import type { APIRoute, GetStaticPaths } from "astro";
import { buildLlmsFull, buildLlmsIndex } from "@shared/lib/llms";
import { FEATURES, SITE } from "@/site.config";
import { locales, t } from "@/i18n/ui";
import { postUrl } from "@/lib/posts";

export const getStaticPaths: GetStaticPaths = () =>
  FEATURES.llmsTxt
    ? [{ params: { llmsFile: "llms" } }, { params: { llmsFile: "llms-full" } }]
    : [];

export const GET: APIRoute = async ({ params, site }) => {
  const options = {
    siteTitle: SITE.title,
    tagline: t("fr").site.tagline,
    description: t("fr").site.description,
    siteUrl: site?.toString() ?? SITE.url,
    locales,
    postUrl,
  };
  const body =
    params.llmsFile === "llms-full"
      ? await buildLlmsFull(options)
      : await buildLlmsIndex(options);

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
