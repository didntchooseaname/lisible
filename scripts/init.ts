import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VARIANTS } from "../shared/variants";
import { installRootDependencies, installVariantDependencies } from "./variant-setup";

const root = new URL("..", import.meta.url).pathname;
const configPath = join(root, "lisible.config.json");

const HEX = /^#[0-9a-fA-F]{6}$/;

function banner() {
  stdout.write(
    "\n  Lisible\n" +
      "  A minimal, fast blog framework built for reading.\n" +
      "  Interactive setup. Press Enter to accept the value in brackets.\n\n",
  );
}

function info(msg: string) {
  stdout.write(msg + "\n");
}

async function main() {
  if (!stdin.isTTY) {
    info("Run this in an interactive terminal: bun run init");
    info("Or edit lisible.config.json directly (field \"variant\").");
    exit(1);
  }

  banner();
  const rl = createInterface({ input: stdin, output: stdout });
  const ask = async (q: string, def = "") => {
    const suffix = def ? ` [${def}]` : "";
    const a = (await rl.question(`${q}${suffix}: `)).trim();
    return a || def;
  };

  info("Choose a variant:");
  VARIANTS.forEach((v, i) => info(`  ${i + 1}. ${v.id}  (${v.label})`));
  let variant: string = "organique";
  while (true) {
    const raw = await ask("\nVariant number or name", "5");
    const byIndex = VARIANTS[Number(raw) - 1];
    const byName = VARIANTS.find((v) => v.id === raw);
    const chosen = byIndex || byName;
    if (chosen) {
      variant = chosen.id;
      break;
    }
    info("  Unknown variant, try again.");
  }
  const variantDir = join(root, "versions", variant);
  if (!existsSync(variantDir)) {
    info(`\nVariant "${variant}" is missing from versions/. Aborting.`);
    exit(1);
  }

  const mode = (await ask("\nSetup mode: (q)uick or (d)etailed", "q")).toLowerCase();
  const detailed = mode.startsWith("d");

  const title = await ask("\nSite title", "Lisible");
  const url = await ask("Site URL", "https://example.com");
  let author = "Lisible";
  let accent = "#22C55E";
  let repoUrl = "";
  if (detailed) {
    author = await ask("Author name (shown in the footer)", author);
    while (true) {
      const a = await ask("Accent color (hex)", accent);
      if (HEX.test(a)) {
        accent = a;
        break;
      }
      info("  Expected a hex color like #22C55E.");
    }
    repoUrl = await ask("Blog repository URL for \"Edit on GitHub\" (optional)", "");
  }

  info("\nSummary");
  info(`  variant : ${variant}`);
  info(`  title   : ${title}`);
  info(`  url     : ${url}`);
  if (detailed) {
    info(`  author  : ${author}`);
    info(`  accent  : ${accent}`);
    info(`  repo    : ${repoUrl || "(none)"}`);
  }
  const ok = (await ask("\nApply this configuration? (y/n)", "y"))
    .toLowerCase()
    .startsWith("y");
  if (!ok) {
    info("Cancelled, nothing was written.");
    rl.close();
    exit(0);
  }

  info(`\nPreparing the "${variant}" variant...`);
  const rootInstallExitCode = installRootDependencies(root);
  if (rootInstallExitCode !== 0) {
    info("  Configuration unchanged. Fix the error, then run bun run init again.");
    rl.close();
    exit(rootInstallExitCode);
  }
  const installExitCode = installVariantDependencies(variant, variantDir, {
    force: true,
  });
  if (installExitCode !== 0) {
    info("  Configuration unchanged. Fix the error, then run bun run init again.");
    rl.close();
    exit(installExitCode);
  }

  writeConfig(variant);
  patchSiteConfig({
    title,
    url,
    author: detailed ? author : undefined,
    accent: detailed ? accent : undefined,
    repoUrl: detailed ? repoUrl : undefined,
  });

  const syncOg = Bun.spawnSync(["bun", "scripts/sync-og-assets.ts"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (syncOg.exitCode !== 0) {
    info("  The configuration was written, but Open Graph assets could not be regenerated.");
    info("  Fix the error, then run bun run sync-og-assets.");
    rl.close();
    exit(syncOg.exitCode);
  }

  info("\nDone.");
  info(`  Active variant: ${variant}`);
  info("  Next steps:");
  info("    bun run dev        start the dev server");
  info("    bun run build      build the static site");
  info("    bun run preview:all install, build and compare every variant");
  info(
    "\n  Fine-tune shared settings in shared/site.config.ts and theme copy in versions/" +
      variant +
      "/src/i18n/ui.ts.\n",
  );
  rl.close();
  exit(0);
}

function writeConfig(variant: string) {
  let json: any = {};
  if (existsSync(configPath)) {
    try {
      json = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      json = {};
    }
  }
  json.variant = variant;
  writeFileSync(configPath, JSON.stringify(json, null, 2) + "\n");
}

function replaceFirst(
  src: string,
  key: string,
  value: string,
): { out: string; hit: boolean } {
  const re = new RegExp(`(\\b${key}:\\s*)"[^"]*"`);
  if (!re.test(src)) return { out: src, hit: false };
  return { out: src.replace(re, `$1${JSON.stringify(value)}`), hit: true };
}

function patchSiteConfig(
  vals: { title: string; url: string; author?: string; accent?: string; repoUrl?: string },
) {
  const p = join(root, "shared", "site.config.ts");
  if (!existsSync(p)) {
    info("  Note: shared/site.config.ts not found, skipped (set values manually).");
    return;
  }
  let src = readFileSync(p, "utf8");
  const misses: string[] = [];
  for (const [key, value] of [
    ["title", vals.title],
    ["url", vals.url],
    ["author", vals.author],
    ["accent", vals.accent],
  ] as const) {
    if (value === undefined) continue;
    const r = replaceFirst(src, key, value);
    src = r.out;
    if (!r.hit) misses.push(key);
  }
  if (vals.repoUrl) {
    const re = /(repo:\s*\{[^}]*?\burl:\s*)"[^"]*"/s;
    if (re.test(src)) src = src.replace(re, `$1${JSON.stringify(vals.repoUrl)}`);
    else misses.push("repo.url");
  }
  writeFileSync(p, src);
  if (misses.length) {
    info(
      `  Note: could not auto-set ${misses.join(", ")} in shared/site.config.ts, set manually.`,
    );
  }
}

main();
