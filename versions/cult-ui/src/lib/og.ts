import { resolve } from "node:path";
import { SITE } from "#src/site.config";


function fontPath(name: string): string {
  return resolve(process.cwd(), "src/assets/fonts", name);
}

export const ogFonts = [
  fontPath("inter-700.ttf"),
  fontPath("inter-400.ttf"),
  fontPath("jetbrains-mono-600.ttf"),
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

const accent = hexToRgb(SITE.accent);

export interface OgPageData {
  title: string;
  description: string;
}

export function ogImageOptions(title: string, description: string) {
  return {
    title: truncate(title, 90),
    description: `${SITE.title} · ${truncate(description, 120)}`,
    dir: "ltr" as const,
    bgGradient: [
      [0, 0, 0],
      [12, 12, 12],
    ] as [number, number, number][],
    border: { color: accent, width: 16, side: "inline-start" as const },
    padding: 70,
    font: {
      title: {
        color: [245, 245, 245] as [number, number, number],
        families: ["Inter"],
        weight: "Bold" as const,
        size: 62,
        lineHeight: 1.15,
      },
      description: {
        color: [161, 161, 161] as [number, number, number],
        families: ["Inter"],
        weight: "Normal" as const,
        size: 30,
        lineHeight: 1.4,
      },
    },
    fonts: ogFonts,
  };
}
