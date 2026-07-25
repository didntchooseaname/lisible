import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { isPublicVariant, VARIANTS } from "../shared/variants";
import { installRootDependencies, installVariantDependencies } from "./variant-setup";

const root = new URL("..", import.meta.url).pathname;
const configPath = join(root, "lisible.config.json");
const config = await Bun.file(configPath).json();
// LISIBLE_VARIANT lets deployment platforms pick the variant without editing
// the configuration file.
const variant: unknown = process.env.LISIBLE_VARIANT || config.variant;
const known = VARIANTS.map(({ id }) => id);
const selected = typeof variant === "string" ? variant : "";
const dir = join(root, "versions", selected);

if (!isPublicVariant(variant) || !existsSync(dir)) {
  console.error(`Unknown or missing variant: "${selected}".`);
  console.error(`Available variants: ${known.join(", ")}`);
  console.error(`Select one in lisible.config.json (the "variant" field) or set LISIBLE_VARIANT.`);
  process.exit(1);
}

const cmd = process.argv[2];
if (cmd === "which" || !cmd) {
  console.log(`Active variant: ${variant}`);
  console.log(VARIANTS.find(({ id }) => id === variant)?.label ?? "");
  process.exit(0);
}

if (!["dev", "build", "preview"].includes(cmd)) {
  console.error(`Unknown command: ${cmd} (expected: dev, build, preview, which)`);
  process.exit(1);
}

const rootInstallExitCode = installRootDependencies(root);
if (rootInstallExitCode !== 0) process.exit(rootInstallExitCode);

if (cmd === "build") {
  const ogCheck = Bun.spawnSync(["bun", "scripts/sync-og-assets.ts", "--check"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (ogCheck.exitCode !== 0) process.exit(ogCheck.exitCode);
}

const installExitCode = installVariantDependencies(variant, dir);
if (installExitCode !== 0) process.exit(installExitCode);

console.log(`[lisible] running ${cmd} for the "${variant}" variant`);
const child = Bun.spawn(["bun", "run", cmd], {
  cwd: dir,
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});
const exitCode = await child.exited;

if (cmd === "build" && exitCode === 0) {
  // Mirror the build into dist/ at the repository root so every deployment
  // platform can publish a stable path regardless of the selected variant.
  const source = join(dir, "dist");
  const target = join(root, "dist");
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
  console.log(`[lisible] build mirrored to dist/ (from versions/${selected}/dist).`);
}

process.exit(exitCode);
