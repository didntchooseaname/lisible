import { existsSync } from "node:fs";
import { join } from "node:path";

type InstallOptions = {
  force?: boolean;
};

export function hasWorkspaceDependencies(root: string) {
  // One sentinel per workspace family (root tooling, shared core, variant
  // toolchain): a partially populated install must not skip the install.
  return [
    join(root, "node_modules", "sharp", "package.json"),
    join(root, "shared", "node_modules", "satori", "package.json"),
    join(root, "versions", "_core", "node_modules", ".bin", "astro"),
  ].every((path) => existsSync(path));
}

export function installRootDependencies(root: string, { force = false }: InstallOptions = {}) {
  if (!force && hasWorkspaceDependencies(root)) return 0;

  // A single install at the repository root covers the whole workspace:
  // the shared core, every variant and the published packages.
  console.log("[lisible] workspace: installing dependencies...");
  const install = Bun.spawnSync(["bun", "install"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });

  if (install.exitCode !== 0) {
    console.error(
      `[lisible] workspace: dependency installation failed (exit code ${install.exitCode}).`,
    );
  }
  return install.exitCode;
}

export function buildVariant(name: string, dir: string) {
  console.log(`[lisible] ${name}: building...`);
  const build = Bun.spawnSync(["bun", "run", "build"], {
    cwd: dir,
    stdout: "inherit",
    stderr: "inherit",
  });

  if (build.exitCode !== 0) {
    console.error(`[lisible] ${name}: build failed (exit code ${build.exitCode}).`);
  }
  return build.exitCode;
}
