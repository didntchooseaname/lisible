import { OGImageRoute } from "astro-og-canvas";
import { SITE, FEATURES } from "@/site.config";
import { getPublishedPosts, postLocale, type Post } from "@/lib/posts";
import { t } from "@/i18n/ui";

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

const accent = hexToRgb(SITE.accent);

interface OgPage {
  title: string;
  description: string;
}

async function collectPages(): Promise<Record<string, OgPage>> {
  if (!FEATURES.ogPerPost) return {};
  const posts: Post[] = [
    ...(await getPublishedPosts("fr")),
    ...(await getPublishedPosts("en")),
  ];
  return Object.fromEntries(
    posts.map((post) => [
      post.id,
      { title: post.data.title, description: post.data.description },
    ]),
  );
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: await collectPages(),
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [10, 10, 12],
      [0, 0, 0],
    ],
    border: { color: accent, width: 16, side: "inline-start" },
    padding: 72,
    font: {
      title: {
        color: [244, 244, 245],
        size: 62,
        lineHeight: 1.15,
        weight: "SemiBold",
        families: ["Inter"],
      },
      description: {
        color: [161, 161, 170],
        size: 30,
        lineHeight: 1.4,
        weight: "Normal",
        families: ["Inter"],
      },
    },
    fonts: [
      "./src/assets/fonts/inter-400.ttf",
      "./src/assets/fonts/inter-600.ttf",
    ],
  }),
});
