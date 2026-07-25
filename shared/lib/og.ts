import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

/**
 * Open Graph rendering, shared by every variant.
 *
 * Fonts are read from the installed @fontsource package rather than fetched at
 * build time: a build that reaches the network to draw a social card fails in
 * CI sandboxes, in air-gapped environments, and whenever the font CDN is down.
 * They are also not committed as binaries, so they cannot drift from the
 * dependency the site actually ships.
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgTheme {
  /** Accent colour, taken from SITE.accent so cards follow the configured brand. */
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  /** Rendered bottom-left next to the accent dot. */
  siteTitle: string;
  /** Optional display face for the title, layered before Inter. */
  displayFont?: { package: string; file: string; name: string };
}

export interface OgContent {
  title: string;
  description: string;
  /** Small uppercase label above the title, e.g. a locale or a section. */
  eyebrow?: string;
}

type SatoriFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

function fontFile(pkg: string, file: string): string {
  return path.resolve(process.cwd(), "node_modules", pkg, "files", file);
}

const fontCache = new Map<string, Promise<SatoriFont[]>>();

function loadFonts(display?: OgTheme["displayFont"]): Promise<SatoriFont[]> {
  const key = display ? `${display.package}/${display.file}` : "inter";
  let fonts = fontCache.get(key);
  if (!fonts) {
    fonts = Promise.all([
      readFile(fontFile("@fontsource/inter", "inter-latin-400-normal.woff")).then(
        (data): SatoriFont => ({ name: "Inter", data, weight: 400, style: "normal" }),
      ),
      readFile(fontFile("@fontsource/inter", "inter-latin-700-normal.woff")).then(
        (data): SatoriFont => ({ name: "Inter", data, weight: 700, style: "normal" }),
      ),
      ...(display
        ? [
            readFile(fontFile(display.package, display.file)).then(
              (data): SatoriFont => ({
                name: display.name,
                data,
                weight: 700,
                style: "normal",
              }),
            ),
          ]
        : []),
    ]);
    fontCache.set(key, fonts);
  }
  return fonts;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

type Node = { type: string; props: Record<string, unknown> };

function box(style: Record<string, unknown>, children?: unknown): Node {
  return { type: "div", props: children === undefined ? { style } : { style, children } };
}

export async function renderOgImage(content: OgContent, theme: OgTheme): Promise<Buffer> {
  const titleFamily = theme.displayFont ? `${theme.displayFont.name}, Inter` : "Inter";

  const tree = box(
    {
      display: "flex",
      flexDirection: "column",
      width: `${OG_WIDTH}px`,
      height: `${OG_HEIGHT}px`,
      backgroundColor: theme.background,
      padding: "96px",
      justifyContent: "center",
    },
    [
      box({
        width: "72px",
        height: "10px",
        backgroundColor: theme.accent,
        borderRadius: "5px",
        marginBottom: "40px",
      }),
      ...(content.eyebrow
        ? [
            box(
              {
                display: "flex",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "4px",
                color: theme.accent,
                marginBottom: "18px",
              },
              content.eyebrow.toUpperCase(),
            ),
          ]
        : []),
      box(
        {
          display: "flex",
          fontFamily: titleFamily,
          fontSize: "68px",
          fontWeight: 700,
          color: theme.foreground,
          lineHeight: 1.15,
          letterSpacing: "-1.5px",
        },
        truncate(content.title, 90),
      ),
      box(
        {
          display: "flex",
          fontSize: "30px",
          fontWeight: 400,
          color: theme.muted,
          lineHeight: 1.4,
          marginTop: "26px",
        },
        truncate(content.description, 140),
      ),
      box({ display: "flex", alignItems: "center", marginTop: "auto" }, [
        box({
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          backgroundColor: theme.accent,
          marginRight: "14px",
        }),
        box(
          {
            display: "flex",
            fontSize: "28px",
            fontWeight: 700,
            color: theme.foreground,
          },
          theme.siteTitle,
        ),
      ]),
    ],
  );

  const svg = await satori(tree as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await loadFonts(theme.displayFont),
  });

  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng(),
  );
}

export function ogImagePath(locale: string, slug: string): string {
  return `/og/${locale}/${slug}.png`;
}
