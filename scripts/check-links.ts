import { access, readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { SHARED_FEATURES } from "../shared/features";
import type { Variant } from "../shared/site.config";

/**
 * Link checker with two independent concerns:
 *
 * - internal (default): offline, validates every internal link found in the
 *   markdown content AND every internal <a href> in the built HTML against
 *   dist/. Blocking in CI: a broken link here is always our bug.
 * - --external: fetches the external links found in the content. Runs in a
 *   scheduled workflow, never in pull requests: a third party being down must
 *   not turn a contribution red.
 *
 * --all runs both (local use).
 */

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
const HTML_HREF = /<a\s[^>]*href="([^"]+)"/g;

const flags = new Set(process.argv.slice(2).filter((argument) => argument.startsWith("--")));
const positional = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const mode = flags.has("--external") ? "external" : flags.has("--all") ? "all" : "internal";

async function activeVariant(): Promise<Variant> {
  const requested = positional[0];
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

async function walk(directory: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind") continue;
      files.push(...(await walk(path, extensions)));
    } else if (extensions.includes(extname(entry.name))) files.push(path);
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

function isInternal(target: string): boolean {
  return target.startsWith("/") && !target.startsWith("//");
}

async function main(): Promise<void> {
  if (!SHARED_FEATURES.linkCheck) return;

  const internal = new Map<string, Set<string>>();
  const external = new Map<string, Set<string>>();
  const articles = await walk(CONTENT, [".md", ".mdx"]);

  for (const file of articles) {
    const source = await readFile(file, "utf8");
    const location = relative(CONTENT, file);
    const targets = new Set<string>();
    for (const match of source.matchAll(MARKDOWN_LINK)) targets.add(match[1].replace(/^<|>$/g, ""));
    for (const url of source.match(BARE_URL) ?? []) targets.add(url.replace(/[.,;:!?)]+$/, ""));
    for (const target of targets) {
      if (target.startsWith("http://") || target.startsWith("https://")) {
        (external.get(target) ?? external.set(target, new Set()).get(target)!).add(location);
      } else if (isInternal(target)) {
        (internal.get(target) ?? internal.set(target, new Set()).get(target)!).add(location);
      }
    }
  }

  const failures: string[] = [];
  let pagesScanned = 0;

  if (mode !== "external") {
    const variant = await activeVariant();
    const dist = join(ROOT, "versions", variant, "dist");
    if (!(await exists(dist)))
      throw new Error(`versions/${variant}/dist is missing. Run the build first.`);

    // Every internal <a href> of the built site must resolve: this covers
    // navigation, footers, cards and generated links, not just the content.
    for (const page of await walk(dist, [".html"])) {
      pagesScanned += 1;
      const html = await readFile(page, "utf8");
      const location = relative(dist, page);
      for (const match of html.matchAll(HTML_HREF)) {
        const target = match[1];
        if (!isInternal(target)) continue;
        (internal.get(target) ?? internal.set(target, new Set()).get(target)!).add(location);
      }
    }

    for (const [target, sources] of internal) {
      if (!(await internalExists(dist, target))) {
        const shown = [...sources].slice(0, 3).join(", ");
        failures.push(`404 ${target} (${shown}${sources.size > 3 ? ", ..." : ""})`);
      }
    }
  }

  if (mode !== "internal") {
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
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(failure));
    process.exit(1);
  }
  const scope =
    mode === "external"
      ? `${external.size} external links`
      : `${internal.size} internal links across ${pagesScanned} pages${
          mode === "all" ? ` and ${external.size} external links` : ""
        }`;
  console.log(`${articles.length} articles, ${scope} validated.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
