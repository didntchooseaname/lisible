import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SITE } from "#src/site.config";
import type { Locale } from "#src/i18n/ui";

const WIDTH = 1200;
const HEIGHT = 630;

const palette = {
  background: "#000000",
  card: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a3a3a3",
  border: "#171717",
  accent: SITE.accent,
} as const;

function fontPath(pkg: string, file: string): string {
  return path.resolve(process.cwd(), "node_modules", pkg, "files", file);
}

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]
> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(fontPath("@fontsource/inter", "inter-latin-400-normal.woff")).then(
      (data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const }),
    ),
    readFile(fontPath("@fontsource/inter", "inter-latin-700-normal.woff")).then(
      (data) => ({ name: "Inter", data, weight: 700 as const, style: "normal" as const }),
    ),
    readFile(
      fontPath("@fontsource/orbitron", "orbitron-latin-700-normal.woff"),
    ).then((data) => ({
      name: "Orbitron",
      data,
      weight: 700 as const,
      style: "normal" as const,
    })),
    readFile(
      fontPath("@fontsource/jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"),
    ).then((data) => ({
      name: "JetBrains Mono",
      data,
      weight: 400 as const,
      style: "normal" as const,
    })),
  ]);
  return fontsPromise;
}

type Node = { type: string; props: Record<string, unknown> };

function el(
  type: string,
  style: Record<string, unknown>,
  children?: Node[] | string,
): Node {
  return { type, props: { style, children } };
}

interface OgInput {
  title: string;
  description: string;
  locale: Locale;
  slug: string;
}

function ogTree({ title, description, locale, slug }: OgInput): Node {
  const catLine = `operator@lisible:~$ cat blog/${locale}/${slug}.md`;
  return el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: palette.background,
      padding: 48,
      fontFamily: "Inter",
    },
    [
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          backgroundColor: palette.card,
          border: `2px solid ${palette.border}`,
          borderTop: `6px solid ${palette.accent}`,
          padding: "44px 56px",
        },
        [
          el(
            "div",
            {
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 24,
              color: palette.accent,
            },
            catLine,
          ),
          el(
            "div",
            {
              display: "flex",
              marginTop: 36,
              fontFamily: "Orbitron",
              fontWeight: 700,
              fontSize: 64,
              lineHeight: 1.15,
              color: palette.foreground,
            },
            title,
          ),
          el(
            "div",
            {
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.45,
              color: palette.muted,
            },
            description,
          ),
          el("div", { display: "flex", flexGrow: 1 }),
          el(
            "div",
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `2px solid ${palette.border}`,
              paddingTop: 28,
            },
            [
              el(
                "div",
                { display: "flex", alignItems: "center", gap: 16 },
                [
                  el(
                    "div",
                    {
                      display: "flex",
                      fontFamily: "JetBrains Mono",
                      fontSize: 28,
                      color: palette.accent,
                    },
                    ">_",
                  ),
                  el(
                    "div",
                    {
                      display: "flex",
                      fontFamily: "Orbitron",
                      fontWeight: 700,
                      fontSize: 30,
                      letterSpacing: "0.18em",
                      color: palette.foreground,
                    },
                    SITE.title.toUpperCase(),
                  ),
                ],
              ),
              el(
                "div",
                {
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 24,
                  color: palette.muted,
                },
                `LOC:${locale.toUpperCase()} :: SYS:OK`,
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export async function renderOgImage(input: OgInput): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const svg = await satori(ogTree(input) as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  }).render();
  return png.asPng();
}
