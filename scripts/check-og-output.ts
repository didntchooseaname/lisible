import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SITE_DEFAULTS } from "../shared/site.config";

const projectRoot = path.resolve(import.meta.dir, "..");
const requested = process.argv.slice(2);
const variants = requested.length > 0
  ? requested
  : (await readdir(path.join(projectRoot, "versions"), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
const accent = SITE_DEFAULTS.accent
  .slice(1)
  .match(/.{2}/g)!
  .map((channel) => Number.parseInt(channel, 16));
const failures: string[] = [];
let checked = 0;

async function collectPng(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPng(target);
    return entry.isFile() && entry.name.endsWith(".png") ? [target] : [];
  }));
  return nested.flat();
}

for (const variant of variants) {
  const dist = path.join(projectRoot, "versions", variant, "dist");
  const candidates = [path.join(dist, "og-default.png"), ...await collectPng(path.join(dist, "og"))];
  const files = (await Promise.all([...new Set(candidates)].map(async (file) =>
    await stat(file).then((value) => value.isFile() ? file : undefined).catch(() => undefined)
  ))).filter((file): file is string => Boolean(file));
  if (files.length === 0) {
    failures.push(`${variant}: no built Open Graph images found`);
    continue;
  }

  for (const file of files) {
    try {
      const image = sharp(file);
      const metadata = await image.metadata();
      if (metadata.width !== 1200 || metadata.height !== 630 || metadata.format !== "png") {
        failures.push(`${path.relative(projectRoot, file)}: expected a 1200x630 PNG`);
        continue;
      }
      const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let found = false;
      for (let index = 0; index < data.length; index += info.channels) {
        if (accent.every((channel, offset) => data[index + offset] === channel)) {
          found = true;
          break;
        }
      }
      if (!found) failures.push(`${path.relative(projectRoot, file)}: missing ${SITE_DEFAULTS.accent}`);
      checked++;
    } catch (error) {
      failures.push(`${path.relative(projectRoot, file)}: ${String(error)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${checked} built Open Graph images across ${variants.length} variants with ${SITE_DEFAULTS.accent}.`);
