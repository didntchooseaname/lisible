import { OGImageRoute } from "astro-og-canvas";
import { FEATURES, SITE } from "@/site.config";
import { getPublishedPosts, postSlug } from "@/lib/posts";
import { locales } from "@/i18n/ui";

interface OgPage {
  title: string;
  description: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const pages: Record<string, OgPage> = {};
if (FEATURES.ogPerPost) {
  for (const locale of locales) {
    const posts = await getPublishedPosts(locale);
    for (const post of posts) {
      pages[`${locale}/${postSlug(post)}`] = {
        title: post.data.title,
        description: post.data.description,
      };
    }
  }
}

const accent = hexToRgb(SITE.accent);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[0, 0, 0]],
    padding: 80,
    border: { color: accent, width: 24, side: "inline-start" },
    font: {
      title: { color: [250, 250, 250], size: 64, weight: "ExtraBold", families: ["Inter"], lineHeight: 1.2 },
      description: { color: [160, 160, 160], size: 30, weight: "Normal", families: ["Inter"], lineHeight: 1.4 },
    },
    fonts: [
      "https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf",
      "https://api.fontsource.org/v1/fonts/inter/latin-800-normal.ttf",
    ],
  }),
});
