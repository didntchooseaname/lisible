import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { OG_HEIGHT, OG_WIDTH, ogImagePath, renderOgImage } from "../../shared/lib/og";

/**
 * og.ts resolves the @fontsource font files from process.cwd()/node_modules.
 * The repo root only installs the shared tooling, the fonts live in each
 * variant's node_modules, so the suite runs the renders from the first variant
 * directory that has @fontsource/inter installed and restores cwd afterwards.
 */
const ROOT = path.resolve(import.meta.dir, "..", "..");
const FONT_FILE = path.join(
  "node_modules",
  "@fontsource",
  "inter",
  "files",
  "inter-latin-400-normal.woff",
);

function findFontHost(): string {
  const versionsDir = path.join(ROOT, "versions");
  const host = readdirSync(versionsDir)
    .map((name) => path.join(versionsDir, name))
    .find((dir) => existsSync(path.join(dir, FONT_FILE)));
  if (!host) {
    throw new Error(
      "No variant with @fontsource/inter installed was found under versions/. " +
        "Run bun install in a variant before running the OG tests.",
    );
  }
  return host;
}

const THEME = {
  accent: "#8ab4f8",
  background: "#0b0e14",
  foreground: "#e6e9ef",
  muted: "#9aa4b2",
  siteTitle: "Lisible",
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let previousCwd: string;

beforeAll(() => {
  previousCwd = process.cwd();
  process.chdir(findFontHost());
});

afterAll(() => {
  process.chdir(previousCwd);
});

describe("constants", () => {
  it("exposes the Open Graph dimensions", () => {
    expect(OG_WIDTH).toBe(1200);
    expect(OG_HEIGHT).toBe(630);
  });
});

describe("ogImagePath", () => {
  it("builds the per post route path", () => {
    expect(ogImagePath("fr", "bienvenue")).toBe("/og/fr/bienvenue.png");
    expect(ogImagePath("en", "welcome")).toBe("/og/en/welcome.png");
  });
});

describe("renderOgImage", () => {
  it("produces a 1200x630 PNG", async () => {
    const png = await renderOgImage(
      {
        title: "Un titre d'article raisonnable",
        description: "Une description de test pour la carte Open Graph.",
        eyebrow: "Blog",
      },
      THEME,
    );

    expect(Buffer.isBuffer(png)).toBe(true);
    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    // The IHDR chunk directly follows the signature: width and height are the
    // two big endian 32 bit integers after the "IHDR" tag.
    expect(png.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect(png.readUInt32BE(16)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_HEIGHT);
  });

  it("truncates oversized copy instead of throwing", async () => {
    const png = await renderOgImage(
      {
        title: "Un titre volontairement interminable ".repeat(6),
        description: "Une description elle aussi beaucoup trop longue pour tenir. ".repeat(5),
      },
      THEME,
    );

    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    expect(png.readUInt32BE(16)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_HEIGHT);
  });
});
