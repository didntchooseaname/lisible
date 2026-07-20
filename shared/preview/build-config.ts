import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AstroIntegration, AstroUserConfig } from "astro";

function normalizedBase(): string | undefined {
  if (process.env.LISIBLE_PREVIEW !== "1") return undefined;
  const value = process.env.LISIBLE_PREVIEW_BASE ?? "/_previews/unknown/";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

export function previewAstroConfig(): Pick<AstroUserConfig, "base" | "outDir"> {
  const base = normalizedBase();
  if (!base) return {};
  const outDir = process.env.LISIBLE_PREVIEW_OUT_DIR;
  return {
    base,
    ...(outDir ? { outDir: resolve(outDir) } : {}),
  };
}

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

export function previewBuildIntegration(): AstroIntegration {
  const base = normalizedBase();
  return {
    name: "lisible-preview-build",
    hooks: {
      "astro:build:done": ({ dir }) => {
        if (!base) return;
        const root = new URL(dir).pathname;
        const patterns = ["images", "katex", "favicon.svg", "og-default.png", "pagefind"];
        const expression = new RegExp(`([=\\(\\s][\\"']?)/(${patterns.map((entry) => entry.replace(".", "\\.")).join("|")})(?=[/\\"'\\)])`, "g");
        for (const file of walk(root).filter((path) => /\.(?:html|css|js)$/.test(path))) {
          const source = readFileSync(file, "utf8");
          const rewritten = source.replace(expression, `$1${base}/$2`);
          if (rewritten !== source) writeFileSync(file, rewritten);
        }
      },
    },
  };
}
