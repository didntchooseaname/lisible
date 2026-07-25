import { lstat, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SITE_DEFAULTS } from "../shared/site.config";

const projectRoot = path.resolve(import.meta.dir, "..");
const checkOnly = process.argv.includes("--check");
const HEX = /^#[0-9a-f]{6}$/i;
const MARKER = /data-og-accent="(#[0-9a-f]{6})"/i;
const canonicalAccent = SITE_DEFAULTS.accent.toUpperCase();

interface Template {
  source: string;
  targets: string[];
}

if (!HEX.test(canonicalAccent)) {
  throw new Error(`shared/site.config.ts: invalid SITE_DEFAULTS.accent ${SITE_DEFAULTS.accent}`);
}

async function templates(): Promise<Template[]> {
  const versionsRoot = path.join(projectRoot, "versions");
  const variants = await readdir(versionsRoot, { withFileTypes: true });
  const result: Template[] = [];

  for (const variant of variants) {
    if (!variant.isDirectory()) continue;
    const assetsRoot = path.join(versionsRoot, variant.name, "src/assets");
    const files = await readdir(assetsRoot).catch(() => []);
    for (const file of files.filter((name) => /^og(?:-[\w-]+)?\.svg$/i.test(name)).sort()) {
      const source = path.relative(projectRoot, path.join(assetsRoot, file));
      const targets: string[] = [];

      if (file === "og-default.svg") {
        if (variant.name === "_core") {
          targets.push("shared/public/og-default.png");
        } else {
          const publicTarget = path.join(versionsRoot, variant.name, "public/og-default.png");
          const targetStat = await lstat(publicTarget).catch(() => undefined);
          if (targetStat && !targetStat.isSymbolicLink()) {
            targets.push(path.relative(projectRoot, publicTarget));
          }
        }
      } else {
        targets.push(source.replace(/\.svg$/i, ".png"));
      }

      result.push({ source, targets });
    }
  }

  return result;
}

function synchronizeTemplate(source: string, svg: string): string {
  const marker = svg.match(MARKER);
  if (!marker) {
    if (!new RegExp(canonicalAccent, "i").test(svg)) {
      throw new Error(`${source}: add data-og-accent to identify the template accent`);
    }
    return svg
      .replace("<svg ", `<svg data-og-accent="${canonicalAccent}" `)
      .replace(new RegExp(canonicalAccent, "gi"), canonicalAccent);
  }

  const previousAccent = marker[1]!;
  return svg.replace(new RegExp(previousAccent, "gi"), canonicalAccent);
}

const ACCENT_CHANNELS = canonicalAccent
  .slice(1)
  .match(/.{2}/g)!
  .map((channel) => Number.parseInt(channel, 16));

/** Number of pixels painted with the exact accent colour. */
async function accentPixels(png: Buffer): Promise<number> {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let count = 0;
  for (let index = 0; index < data.length; index += info.channels) {
    if (ACCENT_CHANNELS.every((channel, offset) => data[index + offset] === channel)) count++;
  }
  return count;
}

async function render(source: string, svg: string): Promise<Buffer> {
  const png = await sharp(Buffer.from(svg))
    .resize(1200, 630, { fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  if ((await accentPixels(png)) < 24) {
    throw new Error(`${source}: rendered image does not visibly contain ${canonicalAccent}`);
  }
  return png;
}

/**
 * Verifies a committed raster without re-rendering it.
 *
 * The templates draw text, so rasterising them depends on the fonts installed on
 * the machine and on the libvips build. Comparing bytes therefore fails on any
 * machine that is not the one that generated them, a CI runner in particular.
 * What has to stay true is the shape of the file and the accent it carries.
 */
async function verifyRaster(target: string, png: Buffer | undefined): Promise<string | null> {
  if (!png) return `${target}: missing, run \`bun run sync-og-assets\``;
  const meta = await sharp(png).metadata().catch(() => undefined);
  if (meta?.width !== 1200 || meta?.height !== 630) {
    return `${target}: expected 1200x630, found ${meta?.width ?? "?"}x${meta?.height ?? "?"}`;
  }
  if ((await accentPixels(png)) < 24) {
    return `${target}: does not visibly contain SITE.accent ${canonicalAccent}`;
  }
  return null;
}

const stale: string[] = [];

for (const template of await templates()) {
  const sourcePath = path.join(projectRoot, template.source);
  const currentSvg = await readFile(sourcePath, "utf8");
  const expectedSvg = synchronizeTemplate(template.source, currentSvg);
  if (currentSvg !== expectedSvg) {
    if (checkOnly) stale.push(template.source);
    else {
      await writeFile(sourcePath, expectedSvg);
      console.log(`[og] synchronized ${template.source} with ${canonicalAccent}`);
    }
  }

  if (template.targets.length === 0) continue;

  if (checkOnly) {
    for (const target of template.targets) {
      const currentPng = await readFile(path.join(projectRoot, target)).catch(() => undefined);
      const problem = await verifyRaster(target, currentPng);
      if (problem) stale.push(problem);
    }
    continue;
  }

  const expectedPng = await render(template.source, expectedSvg);
  for (const target of template.targets) {
    const targetPath = path.join(projectRoot, target);
    const currentPng = await readFile(targetPath).catch(() => undefined);
    if (currentPng?.equals(expectedPng)) continue;
    await writeFile(targetPath, expectedPng);
    console.log(`[og] rendered ${target} with ${canonicalAccent}`);
  }
}

if (stale.length > 0) {
  console.error(
    `[og] stale Open Graph assets:\n${[...new Set(stale)].map((entry) => `- ${entry}`).join("\n")}\n` +
      "Run `bun run sync-og-assets` from the repository root.",
  );
  process.exit(1);
}

if (checkOnly) console.log(`[og] source and raster assets match SITE.accent ${canonicalAccent}`);
