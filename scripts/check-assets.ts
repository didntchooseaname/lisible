import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import type { Variant } from "../shared/site.config";

const ROOT = join(import.meta.dirname, "..");
const VARIANTS = new Set<Variant>([
  "_core",
  "aceternity",
  "cult-ui",
  "h4x0r",
  "motion-primitives",
  "organique",
  "reactbits",
]);

const LIMITS = {
  image: Number(process.env.ASSET_IMAGE_LIMIT_BYTES ?? 1_500_000),
  video: Number(process.env.ASSET_VIDEO_LIMIT_BYTES ?? 4_000_000),
  font: Number(process.env.ASSET_FONT_LIMIT_BYTES ?? 400_000),
  other: Number(process.env.ASSET_OTHER_LIMIT_BYTES ?? 8_000_000),
};

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const FONT_EXTENSIONS = new Set([".woff", ".woff2", ".ttf", ".otf"]);

interface Violation {
  path: string;
  size: number;
  limit: number;
}

async function activeVariant(): Promise<Variant> {
  const requested = process.argv[2];
  if (requested && VARIANTS.has(requested as Variant)) return requested as Variant;
  const config = JSON.parse(await readFile(join(ROOT, "lisible.config.json"), "utf8"));
  if (VARIANTS.has(config.variant as Variant)) return config.variant as Variant;
  throw new Error(`Invalid variant: ${requested ?? config.variant ?? "missing"}`);
}

function limitFor(path: string): number {
  const extension = extname(path).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return LIMITS.image;
  if (VIDEO_EXTENSIONS.has(extension)) return LIMITS.video;
  if (FONT_EXTENSIONS.has(extension)) return LIMITS.font;
  return LIMITS.other;
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat();
}

async function main(): Promise<void> {
  const variant = await activeVariant();
  const dist = join(ROOT, "versions", variant, "dist");
  if (!existsSync(dist)) throw new Error(`versions/${variant}/dist is missing. Run the build first.`);

  const files = await walk(dist);
  const violations: Violation[] = [];
  const stylesheetErrors: string[] = [];
  for (const file of files) {
    const size = (await stat(file)).size;
    const limit = limitFor(file);
    if (size > limit) violations.push({ path: relative(dist, file), size, limit });

    if (extname(file) === ".html") {
      const html = await readFile(file, "utf8");
      const stylesheets = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/g)]
        .map((match) => match[1]!);
      const page = relative(dist, file);
      const isRedirect = /<meta\b[^>]*\bhttp-equiv=["']refresh["']/i.test(html);
      if (!isRedirect && !stylesheets.some((href) => /\/_astro\/app\.[^/]+\.css(?:\?|$)/.test(href))) {
        stylesheetErrors.push(`${page}: missing the global app stylesheet.`);
      }
      for (const href of stylesheets) {
        if (/^(?:https?:)?\/\//.test(href)) continue;
        const target = join(dist, href.split(/[?#]/, 1)[0]!.replace(/^\//, ""));
        if (!existsSync(target)) stylesheetErrors.push(`${page}: missing stylesheet asset ${href}.`);
      }
    }
  }

  if (violations.length === 0 && stylesheetErrors.length === 0) {
    console.log(`Asset budget passed for ${variant} (${files.length} files).`);
    return;
  }

  for (const violation of violations.sort((a, b) => b.size - a.size)) {
    console.error(`${formatBytes(violation.size)} > ${formatBytes(violation.limit)}  ${violation.path}`);
  }
  for (const error of stylesheetErrors) console.error(error);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
