import { OGImageRoute } from "astro-og-canvas";
import { getPublishedPosts, postOgKey, type Post } from "@/lib/posts";
import { FEATURES } from "@/site.config";
import { truncate } from "@/lib/utils";

const ACCENT: [number, number, number] = [34, 197, 94];

const FONTS = [
  "./src/assets/og-fonts/inter-400.ttf",
  "./src/assets/og-fonts/inter-600.ttf",
  "./src/assets/og-fonts/inter-700.ttf",
];

async function buildPages(): Promise<Record<string, Post>> {
  if (!FEATURES.ogPerPost) return {};
  const pages: Record<string, Post> = {};
  for (const locale of ["fr", "en"] as const) {
    for (const post of await getPublishedPosts(locale)) {
      pages[postOgKey(post)] = post;
    }
  }
  return pages;
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages: await buildPages(),
  getImageOptions: (_path, post: Post) => ({
    title: post.data.title,
    description: truncate(post.data.description, 140),
    bgGradient: [
      [12, 12, 14],
      [0, 0, 0],
    ],
    border: { color: ACCENT, width: 24, side: "inline-start" },
    padding: 80,
    font: {
      title: {
        color: [237, 237, 237],
        size: 66,
        weight: "Bold",
        lineHeight: 1.15,
        families: ["Inter"],
      },
      description: {
        color: [150, 150, 150],
        size: 32,
        weight: "Normal",
        lineHeight: 1.4,
        families: ["Inter"],
      },
    },
    fonts: FONTS,
  }),
});
