import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "#src/site.config";

const fontDir = join(process.cwd(), "src/assets/fonts");
const fontRegular = readFileSync(join(fontDir, "Inter-Regular.ttf"));
const fontBold = readFileSync(join(fontDir, "Inter-Bold.ttf"));

const WIDTH = 1200;
const HEIGHT = 630;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

interface OgOptions {
  title: string;
  description: string;
}

export async function renderOgImage({
  title,
  description,
}: OgOptions): Promise<Buffer> {
  const accent = SITE.accent;
  const tree = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        backgroundColor: "#000000",
        padding: "100px",
        justifyContent: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              width: "72px",
              height: "10px",
              backgroundColor: accent,
              borderRadius: "5px",
              marginBottom: "44px",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "68px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            },
            children: truncate(title, 90),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "30px",
              fontWeight: 400,
              color: "#a3a3a3",
              lineHeight: 1.4,
              marginTop: "28px",
            },
            children: truncate(description, 140),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "16px",
                    height: "16px",
                    borderRadius: "999px",
                    backgroundColor: accent,
                    marginRight: "14px",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#ffffff",
                  },
                  children: SITE.title,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
      { name: "Inter", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng();

  return Buffer.from(png);
}

export function ogImagePath(locale: string, slug: string): string {
  return `/og/${locale}/${slug}.png`;
}
