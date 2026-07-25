import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Deployment platforms check out git symlinks as plain text files, so the
// shared routes and assets linked into each variant must be replaced by real
// copies before building there. The list is discovered by scanning the variant
// directory instead of being maintained by hand: any tracked symlink is
// covered automatically, including routes added later.

const configVariant = (() => {
  try {
    const config = JSON.parse(
      readFileSync(new URL("../lisible.config.json", import.meta.url), "utf8"),
    );
    return typeof config.variant === "string" ? config.variant : undefined;
  } catch {
    return undefined;
  }
})();
const variant = process.argv[2] ?? process.env.LISIBLE_VARIANT ?? configVariant ?? "organique";
if (process.env.CI !== "true") {
  throw new Error("Deployment links may only be materialized in CI.");
}

const root = fileURLToPath(new URL("..", import.meta.url));
const variantRoot = join(root, "versions", variant);
if (!existsSync(variantRoot)) {
  const known = readdirSync(join(root, "versions"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .join(", ");
  throw new Error(`Unknown variant: ${variant} (expected one of: ${known})`);
}

const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", ".vscode"]);

function collectSymlinks(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      found.push(path);
    } else if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      found.push(...collectSymlinks(path));
    }
  }
  return found;
}

const links = collectSymlinks(variantRoot);
for (const link of links) {
  const target = realpathSync(link);
  if (!statSync(target).isFile()) {
    throw new Error(`Symlink target is not a regular file: ${link} -> ${target}`);
  }
  unlinkSync(link);
  copyFileSync(target, link);
  console.log(`[lisible] ${variant}: materialized ${relative(root, link)}`);
}

console.log(`[lisible] ${variant}: materialized ${links.length} shared deployment files.`);
