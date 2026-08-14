import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Rendering drift net for refactors: hashes the normalized HTML of every page
 * in every built variant. Save a baseline before a refactor, rebuild, then
 * compare: any page whose HTML changed must be justified by the change at
 * hand. Asset hashes, Pagefind output and generated images are normalized or
 * ignored because they differ between builds without meaning anything.
 *
 *   bun run check-drift --save        capture the baseline from versions/[star]/dist
 *   bun run check-drift               compare the current dist against the baseline
 */

const root = new URL("..", import.meta.url).pathname;
const baselinePath = join(root, ".drift-baseline.json");
const save = process.argv.includes("--save");
const force = process.argv.includes("--force");

const TARGETS = [
  "_core",
  "aceternity",
  "cult-ui",
  "h4x0r",
  "motion-primitives",
  "organique",
  "reactbits",
];

function normalize(html: string): string {
  return (
    html
      // Hashed asset references change on every build without a real change.
      .replace(/\/_astro\/[A-Za-z0-9._[\]@-]+\.([A-Za-z0-9_-]{8,})\./g, "/_astro/X.")
      // Astro island ids and uids are not stable between builds.
      .replace(/\bdata-astro-cid-[a-z0-9]+/g, "data-astro-cid-X")
      .replace(/\buid="[A-Za-z0-9]+"/g, 'uid="X"')
      // Diagram counters are global across the build, so they depend on page
      // build order, which is not deterministic.
      .replace(/\bid="(mermaid|drawio)-\d+"/g, 'id="$1-X"')
      .replace(/\baria-describedby="(mermaid|drawio)-\d+/g, 'aria-describedby="$1-X')
      .replace(/\bdata-diagram-id="(mermaid|drawio)-\d+"/g, 'data-diagram-id="$1-X"')
      // The React renderer numbers every island's useId prefix from a
      // build-wide counter, so it depends on page build order as well.
      .replace(/\bprefix="r\d+"/g, 'prefix="rX"')
  );
}

function collectPages(dir: string, base: string, pages: Map<string, string>): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind" || entry.name === "og" || entry.name === "_astro") continue;
      collectPages(path, base, pages);
    } else if (
      entry.name.endsWith(".html") ||
      entry.name.endsWith(".xml") ||
      entry.name.endsWith(".txt")
    ) {
      const content = normalize(readFileSync(path, "utf8"));
      pages.set(
        relative(base, path),
        createHash("sha256").update(content).digest("hex").slice(0, 16),
      );
    }
  }
}

function snapshot(): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const target of TARGETS) {
    const dist = join(root, "versions", target, "dist");
    if (!existsSync(dist)) {
      console.error(`[lisible] check-drift: ${target} has no dist/, build it first.`);
      process.exit(1);
    }
    const pages = new Map<string, string>();
    collectPages(dist, dist, pages);
    result[target] = Object.fromEntries([...pages.entries()].sort());
  }
  return result;
}

const current = snapshot();

function compare(baseline: Record<string, Record<string, string>>): string[] {
  const drifts: string[] = [];
  for (const target of TARGETS) {
    const before = baseline[target] ?? {};
    const after = current[target] ?? {};
    for (const page of Object.keys(before)) {
      if (!(page in after)) drifts.push(`${target}/${page}: page removed`);
      else if (before[page] !== after[page]) drifts.push(`${target}/${page}: content changed`);
    }
    for (const page of Object.keys(after)) {
      if (!(page in before)) drifts.push(`${target}/${page}: page added`);
    }
  }
  return drifts;
}

function printDrifts(drifts: string[]): void {
  console.error(`[lisible] check-drift: ${drifts.length} difference(s) against the baseline:`);
  for (const drift of drifts.slice(0, 60)) console.error(`  - ${drift}`);
  if (drifts.length > 60) console.error(`  ... and ${drifts.length - 60} more`);
}

if (save) {
  // The baseline is versioned, so a save that changes it must be a decision,
  // not a reflex: refuse to overwrite a diverging baseline without --force,
  // and show what would change so the overwrite is reviewed, not blind.
  if (existsSync(baselinePath) && !force) {
    const drifts = compare(JSON.parse(readFileSync(baselinePath, "utf8")));
    if (drifts.length > 0) {
      printDrifts(drifts);
      console.error(
        "[lisible] check-drift: the current build diverges from the saved baseline. " +
          "Review the list above, then rerun with --force to accept it.",
      );
      process.exit(1);
    }
  }
  writeFileSync(baselinePath, JSON.stringify(current, null, 1));
  const total = Object.values(current).reduce((n, pages) => n + Object.keys(pages).length, 0);
  console.log(
    `[lisible] check-drift: baseline saved (${total} pages across ${TARGETS.length} targets).`,
  );
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error("[lisible] check-drift: no baseline. Run: bun run check-drift --save");
  process.exit(1);
}

const drifts = compare(JSON.parse(readFileSync(baselinePath, "utf8")));

if (drifts.length > 0) {
  printDrifts(drifts);
  process.exit(1);
}

console.log("[lisible] check-drift: no drift against the baseline.");
