import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { SHARED_FEATURES } from "../shared/features";
import type { Variant } from "../shared/site.config";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "shared/content/blog");
const VARIANTS = new Set<Variant>([
  "_core",
  "aceternity",
  "cult-ui",
  "h4x0r",
  "motion-primitives",
  "organique",
  "reactbits",
]);
const TIMEOUT_MS = 8_000;
const CONCURRENCY = 5;
const MARKDOWN_LINK = /\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
const BARE_URL = /(?<![("'])https?:\/\/[^\s"'`<>\])]+/g;

async function activeVariant(): Promise<Variant> {
  const requested = process.argv[2];
  if (requested && VARIANTS.has(requested as Variant)) return requested as Variant;
  const config = JSON.parse(await readFile(join(ROOT, "lisible.config.json"), "utf8"));
  if (VARIANTS.has(config.variant as Variant)) return config.variant as Variant;
  throw new Error(`Invalid variant: ${requested ?? config.variant ?? "missing"}`);
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if ([".md", ".mdx"].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

async function internalExists(dist: string, target: string): Promise<boolean> {
  const clean = decodeURI(target.split("#")[0].split("?")[0]).replace(/^\/+|\/+$/g, "");
  const path = join(dist, clean);
  const candidates = clean
    ? [path, `${path}.html`, join(path, "index.html")]
    : [join(dist, "index.html")];
  for (const candidate of candidates) {
    if (await exists(candidate)) return true;
  }
  return false;
}

async function checkExternal(url: string): Promise<number | string> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        headers: { "User-Agent": "lisible-link-checker/1.0" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (method === "HEAD" && [403, 405].includes(response.status)) continue;
      return response.status;
    } catch (error) {
      if (method === "GET") return error instanceof Error ? error.message : "Unknown error";
    }
  }
  return "Failed";
}

async function main(): Promise<void> {
  if (!SHARED_FEATURES.linkCheck) return;
  const variant = await activeVariant();
  const dist = join(ROOT, "versions", variant, "dist");
  if (!(await exists(dist))) throw new Error(`versions/${variant}/dist is missing. Run the build first.`);

  const internal = new Map<string, Set<string>>();
  const external = new Map<string, Set<string>>();
  const files = await walk(CONTENT);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const location = relative(CONTENT, file);
    const targets = new Set<string>();
    for (const match of source.matchAll(MARKDOWN_LINK)) targets.add(match[1].replace(/^<|>$/g, ""));
    for (const url of source.match(BARE_URL) ?? []) targets.add(url.replace(/[.,;:!?)]+$/, ""));
    for (const target of targets) {
      if (target.startsWith("http://") || target.startsWith("https://")) {
        (external.get(target) ?? external.set(target, new Set()).get(target)!).add(location);
      } else if (target.startsWith("/") && !target.startsWith("//")) {
        (internal.get(target) ?? internal.set(target, new Set()).get(target)!).add(location);
      }
    }
  }

  const failures: string[] = [];
  for (const [target, sources] of internal) {
    if (!(await internalExists(dist, target))) failures.push(`404 ${target} (${[...sources].join(", ")})`);
  }

  const urls = [...external.keys()];
  for (let index = 0; index < urls.length; index += CONCURRENCY) {
    const batch = urls.slice(index, index + CONCURRENCY);
    const statuses = await Promise.all(batch.map(checkExternal));
    statuses.forEach((status, offset) => {
      if (typeof status === "string" || status >= 400) {
        const url = batch[offset];
        failures.push(`${status} ${url} (${[...(external.get(url) ?? [])].join(", ")})`);
      }
    });
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(failure));
    process.exit(1);
  }
  console.log(`${files.length} articles, ${internal.size} internal links, and ${external.size} external links validated for ${variant}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
