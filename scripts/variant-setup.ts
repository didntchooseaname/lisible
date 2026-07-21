import { existsSync } from "node:fs";
import { join } from "node:path";

type InstallOptions = {
  force?: boolean;
};

export function hasVariantDependencies(dir: string) {
  return existsSync(join(dir, "node_modules", ".bin", "astro"));
}

export function hasRootDependencies(root: string) {
  return existsSync(join(root, "node_modules", "sharp", "package.json"));
}

export function installRootDependencies(
  root: string,
  { force = false }: InstallOptions = {},
) {
  if (!force && hasRootDependencies(root)) return 0;

  console.log("[lisible] root: installing tooling dependencies...");
  const install = Bun.spawnSync(["bun", "install"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });

  if (install.exitCode !== 0) {
    console.error(
      `[lisible] root: dependency installation failed (exit code ${install.exitCode}).`,
    );
  }
  return install.exitCode;
}

export function installVariantDependencies(
  name: string,
  dir: string,
  { force = false }: InstallOptions = {},
) {
  if (!force && hasVariantDependencies(dir)) return 0;

  console.log(`[lisible] ${name}: installing dependencies...`);
  const install = Bun.spawnSync(["bun", "install"], {
    cwd: dir,
    stdout: "inherit",
    stderr: "inherit",
  });

  if (install.exitCode !== 0) {
    console.error(
      `[lisible] ${name}: dependency installation failed (exit code ${install.exitCode}).`,
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
    console.error(
      `[lisible] ${name}: build failed (exit code ${build.exitCode}).`,
    );
  }
  return build.exitCode;
}
