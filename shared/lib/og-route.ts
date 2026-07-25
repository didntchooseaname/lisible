import type { APIRoute } from "astro";
import { getPublishedPosts, postSlug, type Post } from "./posts";
import { renderOgImage, type OgTheme } from "./og";
import type { Locale } from "./format";

/**
 * Builds the per-post Open Graph route every variant exposes at
 * `/og/<locale>/<slug>.png`, so the route file only has to supply its theme.
 */
export function ogImageRoute(options: {
  enabled: boolean;
  locales: readonly Locale[];
  theme: OgTheme;
  /** Optional per-post override, e.g. a variant that labels the locale. */
  eyebrow?: (post: Post, locale: Locale) => string | undefined;
}) {
  async function getStaticPaths() {
    if (!options.enabled) return [];
    const paths = [];
    for (const locale of options.locales) {
      for (const post of await getPublishedPosts(locale)) {
        paths.push({
          params: { slug: `${locale}/${postSlug(post)}` },
          props: { post, locale },
        });
      }
    }
    return paths;
  }

  const GET: APIRoute = async ({ props }) => {
    const { post, locale } = props as { post: Post; locale: Locale };
    const png = await renderOgImage(
      {
        title: post.data.title,
        description: post.data.description,
        eyebrow: options.eyebrow?.(post, locale),
      },
      options.theme,
    );
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  };

  return { getStaticPaths, GET };
}
