import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

/**
 * Removes the demonstration content a fresh blog should not publish: the demo
 * articles, the placeholder certifications and friends, and the portfolio
 * pages built on them. A new bilingual welcome draft replaces the old one so
 * the blog never starts empty.
 *
 *   bun run clean-demo                 interactive confirmation
 *   bun run clean-demo --yes           no questions asked
 *   bun run clean-demo --keep-demo-post  keep demo-fonctionnalites as reference
 */

const root = new URL("..", import.meta.url).pathname;
const contentDir = join(root, "shared/content/blog");
const portfolioDir = join(root, "shared/content/portfolio");
const configPath = join(root, "lisible.config.json");

const DEMO_SLUGS = [
  "bienvenue",
  "brouillon-exemple",
  "certification-inclusive-interfaces",
  "certification-systems-architecture",
  "certification-web-foundations",
  "demo-fonctionnalites",
  "guide-astro-islands",
  "performance-web",
  "theming-dark-first",
  "typographie-editoriale",
];

const args = process.argv.slice(2);
const assumeYes = args.includes("--yes");
const keepDemoPost = args.includes("--keep-demo-post");

const slugs = DEMO_SLUGS.filter((slug) => !(keepDemoPost && slug === "demo-fonctionnalites"));
const targets: string[] = [];
for (const locale of ["fr", "en"]) {
  for (const slug of slugs) {
    for (const extension of ["mdx", "md"]) {
      const path = join(contentDir, locale, `${slug}.${extension}`);
      if (existsSync(path)) targets.push(path);
    }
  }
}

// The welcome draft this script scaffolds shares its slug with the shipped
// demo post, so a leftover bienvenue alone never triggers another wipe.
const meaningful = targets.filter((path) => !/[\\/]bienvenue\.mdx?$/.test(path));
if (meaningful.length === 0) {
  console.log("Nothing to clean: the demo articles are already gone.");
  exit(0);
}

console.log(`About to remove ${targets.length} demo article file(s),`);
console.log("empty the portfolio data, disable the portfolio pages,");
console.log("and scaffold a fresh bilingual welcome draft.");

if (!assumeYes) {
  if (!stdin.isTTY) {
    console.log("Run this in an interactive terminal, or pass --yes.");
    exit(1);
  }
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question("Proceed? (y/n) ")).trim().toLowerCase();
  rl.close();
  if (!answer.startsWith("y")) {
    console.log("Cancelled, nothing was removed.");
    exit(0);
  }
}

for (const path of targets) {
  rmSync(path);
}
console.log(`Removed ${targets.length} demo article file(s).`);

for (const name of ["certifications.json", "friends.json"]) {
  writeFileSync(join(portfolioDir, name), "[]\n");
}
console.log("Emptied the portfolio data.");

let config: Record<string, unknown> = {};
try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
  config = {};
}
const features = (config.features ??= {}) as Record<string, unknown>;
const portfolio = (features.portfolio ??= {}) as Record<string, unknown>;
portfolio.enabled = false;
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log("Disabled the portfolio pages (features.portfolio.enabled).");

const scaffold = Bun.spawnSync(
  [
    "bun",
    "scripts/new-post.ts",
    "bienvenue",
    "--translate",
    "--title",
    "Bienvenue",
    "--title-en",
    "Welcome",
  ],
  { cwd: root, stdout: "inherit", stderr: "inherit" },
);
if (scaffold.exitCode !== 0) {
  console.log("The welcome draft could not be scaffolded; create one with bun run new-post.");
  exit(scaffold.exitCode ?? 1);
}

console.log("\nDone. Your content now lives in shared/content/blog/.");
console.log("Set draft: false in the welcome post when it is ready.");
