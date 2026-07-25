import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { SHARED_FEATURES } from "../shared/features";

/**
 * Cross variant conformance: the contract that lets seven build targets share
 * one core without drifting apart. Five checks:
 *
 * 1. Routes: every variant exposes the same src/pages tree as _core.
 * 2. MDX contract: every "@/" import used by shared content resolves in every
 *    variant.
 * 3. Flags: every feature flag is read by every variant (or by scripts), with
 *    deviations declared in conformance-exceptions.json.
 * 4. Dist parity: when every target is built, they emit the same page paths.
 * 5. Shims: files declared as shared shims must stay one line re-exports;
 *    re-forking one requires an explicit exception.
 */

const root = new URL("..", import.meta.url).pathname;
const TARGETS = [
  "_core",
  "aceternity",
  "cult-ui",
  "h4x0r",
  "motion-primitives",
  "organique",
  "reactbits",
];

interface Exceptions {
  unreadFlags?: Record<string, { variants: string[]; reason: string }>;
  scriptLevelFlags?: Record<string, string>;
  extraRoutes?: Record<string, string[]>;
  sharedShims?: string[];
}

const exceptions: Exceptions = JSON.parse(
  readFileSync(join(root, "conformance-exceptions.json"), "utf8"),
);
const failures: string[] = [];

function walk(dir: string, base: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path, base));
    else files.push(relative(base, path));
  }
  return files.sort();
}

// 1. Route parity against _core.
const referencePages = walk(join(root, "versions/_core/src/pages"), join(root, "versions/_core/src/pages"));
for (const target of TARGETS.slice(1)) {
  const pagesDir = join(root, "versions", target, "src/pages");
  const pages = walk(pagesDir, pagesDir);
  const allowed = new Set(exceptions.extraRoutes?.[target] ?? []);
  for (const page of referencePages) {
    if (!pages.includes(page)) failures.push(`${target}: missing route src/pages/${page}`);
  }
  for (const page of pages) {
    if (!referencePages.includes(page) && !allowed.has(page)) {
      failures.push(`${target}: extra route src/pages/${page} (declare it in conformance-exceptions.json)`);
    }
  }
}

// 2. MDX component contract derived from the shared content.
const contentDir = join(root, "shared/content");
const mdxImports = new Set<string>();
for (const file of walk(contentDir, contentDir)) {
  if (!file.endsWith(".mdx")) continue;
  const source = readFileSync(join(contentDir, file), "utf8");
  for (const match of source.matchAll(/from\s+"@\/([^"]+)"/g)) {
    mdxImports.add(match[1]);
  }
}
const RESOLVE_SUFFIXES = ["", ".ts", ".tsx", ".astro", "/index.ts", "/index.tsx"];
for (const target of TARGETS) {
  for (const specifier of mdxImports) {
    const found = RESOLVE_SUFFIXES.some((suffix) =>
      existsSync(join(root, "versions", target, "src", `${specifier}${suffix}`)),
    );
    if (!found) {
      failures.push(`${target}: shared content imports "@/${specifier}" but src/${specifier} does not resolve`);
    }
  }
}

// 3. Every flag is read somewhere it matters.
function grepDir(dir: string, needle: string): boolean {
  if (!existsSync(dir)) return false;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".astro") continue;
      if (grepDir(path, needle)) return true;
    } else if (/\.(ts|tsx|astro|mjs|js)$/.test(entry.name)) {
      if (readFileSync(path, "utf8").includes(needle)) return true;
    }
  }
  return false;
}
for (const flag of Object.keys(SHARED_FEATURES)) {
  if (exceptions.scriptLevelFlags?.[flag]) {
    if (!grepDir(join(root, "scripts"), `SHARED_FEATURES.${flag}`)) {
      failures.push(`flag ${flag}: declared script level but no script reads SHARED_FEATURES.${flag}`);
    }
    continue;
  }
  for (const target of TARGETS) {
    if (exceptions.unreadFlags?.[flag]?.variants.includes(target)) continue;
    const reads =
      grepDir(join(root, "versions", target, "src"), `FEATURES.${flag}`) ||
      readFileSync(join(root, "versions", target, "astro.config.ts"), "utf8").includes(
        `FEATURES.${flag}`,
      );
    if (!reads) {
      failures.push(`${target}: flag ${flag} is never read (declare an exception or honor it)`);
    }
  }
}

// 4. Dist parity, only when every target is built.
const allBuilt = TARGETS.every((target) => existsSync(join(root, "versions", target, "dist")));
if (allBuilt) {
  const pagesOf = (target: string): string[] => {
    const dist = join(root, "versions", target, "dist");
    return walk(dist, dist).filter(
      (page) => page.endsWith(".html") && !page.startsWith("pagefind/"),
    );
  };
  const reference = pagesOf("_core");
  for (const target of TARGETS.slice(1)) {
    const pages = new Set(pagesOf(target));
    for (const page of reference) {
      if (!pages.has(page)) failures.push(`${target}: dist misses ${page} that _core emits`);
    }
    for (const page of pages) {
      if (!reference.includes(page)) failures.push(`${target}: dist emits ${page} that _core does not`);
    }
  }
} else {
  console.log("[lisible] check-conformance: dist parity skipped (not every target is built).");
}

// 5. Declared shims must stay one line re-exports.
for (const shim of exceptions.sharedShims ?? []) {
  for (const target of TARGETS) {
    const path = join(root, "versions", target, shim);
    if (!existsSync(path)) continue;
    const meaningful = readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("*") && !line.trim().startsWith("/*"));
    const isReExport = meaningful.length <= 2 && meaningful.every((line) => /^(export|import)\b.*@shared/.test(line.trim()));
    if (!isReExport) {
      failures.push(`${target}: ${shim} is declared as a shared shim but is not a one line re-export`);
    }
  }
}

if (failures.length > 0) {
  console.error(`[lisible] check-conformance: ${failures.length} violation(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `[lisible] check-conformance: ${TARGETS.length} targets conform (${referencePages.length} routes, ${mdxImports.size} content imports, ${Object.keys(SHARED_FEATURES).length} flags).`,
);
