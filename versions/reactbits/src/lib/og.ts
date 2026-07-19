import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE } from "#src/site.config";

const fontDir = join(process.cwd(), "src/assets/fonts");
const fontRegular = readFileSync(join(fontDir, "NotoSans-Regular.ttf"));
const fontBold = readFileSync(join(fontDir, "NotoSans-Bold.ttf"));

const BG = "#000000";
const FG = "#ffffff";
const MUTED = "#a3a3a3";
const DIM = "#737373";

function truncate(value: string, max: number): string {
  const clean = value.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

type Node = {
  type: string;
  props: { style: Record<string, unknown>; children?: unknown };
};

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): Node => ({ type, props: { style, children } });

export interface OgInput {
  title: string;
  description: string;
  accent?: string;
}

export async function renderOgImage(input: OgInput): Promise<Buffer> {
  const accent = input.accent ?? SITE.accent;
  const title = truncate(input.title, 90);
  const description = truncate(input.description, 140);

  const tree = el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      backgroundColor: BG,
      color: FG,
      padding: "96px",
      fontFamily: "Noto Sans",
    },
    [
      el("div", { display: "flex", flexDirection: "column" }, [
        el("div", {
          width: "120px",
          height: "8px",
          borderRadius: "4px",
          backgroundColor: accent,
          marginBottom: "36px",
        }),
        el(
          "div",
          { fontSize: "32px", fontWeight: 700, color: MUTED, letterSpacing: "0.5px" },
          SITE.title,
        ),
      ]),
      el("div", { display: "flex", flexDirection: "column" }, [
        el(
          "div",
          {
            fontSize: "68px",
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-1px",
            color: FG,
          },
          title,
        ),
        el(
          "div",
          { fontSize: "32px", lineHeight: 1.4, color: MUTED, marginTop: "28px" },
          description,
        ),
      ]),
      el(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
        [
          el(
            "div",
            { fontSize: "26px", color: DIM },
            new URL(SITE.url).host,
          ),
          el("div", {
            width: "24px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: accent,
          }),
        ],
      ),
    ],
  );

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Sans", data: fontRegular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const png = new Resvg(svg, { background: BG }).render().asPng();
  return Buffer.from(png);
}
