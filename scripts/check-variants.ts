import { existsSync } from "node:fs";
import { join } from "node:path";
import { VARIANTS, isPublicVariant } from "../shared/variants";
import { installRootDependencies, installVariantDependencies } from "./variant-setup";

/**
 * Verifies every variant, not just the one selected in lisible.config.json.
 *
 * The per-variant checks used to run against the active variant only, which is
 * how six of the seven variants drifted apart without anything failing.
 */
const root = new URL("..", import.meta.url).pathname;

const ALL = ["_core", ...VARIANTS.map(({ id }) => id)] as const;
type Target = (typeof ALL)[number];

const requested = process.argv.slice(2).filter((argument) => !argument.startsWith("--"));
const skipBuild = process.argv.includes("--no-build");
const skipTypecheck = process.argv.includes("--no-typecheck");
const onlyTypecheck = process.argv.includes("--typecheck-only");
const targets: Target[] = requested.length > 0 ? (requested as Target[]) : [...ALL];

for (const target of targets) {
  if (target !== "_core" && !isPublicVariant(target)) {
    console.error(`Unknown variant: "${target}". Available: ${ALL.join(", ")}`);
    process.exit(1);
  }
}

function run(command: string[], cwd: string, label?: string): number {
  // Name each sub-command so a CI log points straight at the one that failed.
  if (label) console.log(`\n[lisible] > ${label}`);
  const result = Bun.spawnSync(command, { cwd, stdout: "inherit", stderr: "inherit" });
  const code = result.exitCode ?? 1;
  if (code !== 0 && label) console.error(`[lisible] < ${label} failed with exit code ${code}`);
  return code;
}

const rootInstall = installRootDependencies(root);
if (rootInstall !== 0) process.exit(rootInstall);

const ogCheck = run(["bun", "scripts/sync-og-assets.ts", "--check"], root, "sync-og-assets --check");
if (ogCheck !== 0) process.exit(ogCheck);

const failures: string[] = [];

for (const variant of targets) {
  const dir = join(root, "versions", variant);
  if (!existsSync(dir)) {
    failures.push(`${variant}: directory is missing`);
    continue;
  }

  console.log(`\n[lisible] === ${variant} ===`);

  const install = installVariantDependencies(variant, dir);
  if (install !== 0) {
    failures.push(`${variant}: dependency installation`);
    continue;
  }

  if (!skipTypecheck && run(["bun", "run", "typecheck"], dir, `${variant}: typecheck`) !== 0) {
    failures.push(`${variant}: typecheck`);
  }
  if (onlyTypecheck) continue;

  if (!skipBuild && run(["bun", "run", "build"], dir, `${variant}: build`) !== 0) {
    failures.push(`${variant}: build`);
    // The link, asset and Open Graph checks all read dist/, so skip them.
    continue;
  }

  if (run(["bun", "scripts/check-links.ts", variant], root, `${variant}: check-links`) !== 0) {
    failures.push(`${variant}: check-links`);
  }
  if (run(["bun", "scripts/check-assets.ts", variant], root, `${variant}: check-assets`) !== 0) {
    failures.push(`${variant}: check-assets`);
  }
  if (!skipBuild && run(["bun", "scripts/check-og-output.ts", variant], root, `${variant}: check-og-output`) !== 0) {
    failures.push(`${variant}: check-og-output`);
  }
}

if (failures.length > 0) {
  console.error(`\n[lisible] ${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`\n[lisible] all checks passed for ${targets.length} variant(s).`);
