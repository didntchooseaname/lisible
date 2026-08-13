import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { DEMO_PROFILE, SITE_DEFAULTS } from "../shared/site.config";
import { VARIANTS } from "../shared/variants";
import { installRootDependencies } from "./variant-setup";

const root = new URL("..", import.meta.url).pathname;
const configPath = join(root, "lisible.config.json");

const HEX = /^#[0-9a-fA-F]{6}$/;

const { values: flags } = parseArgs({
  args: process.argv.slice(2),
  options: {
    variant: { type: "string" },
    title: { type: "string" },
    url: { type: "string" },
    author: { type: "string" },
    accent: { type: "string" },
    repo: { type: "string" },
    github: { type: "string" },
    bluesky: { type: "string" },
    mastodon: { type: "string" },
    linkedin: { type: "string" },
    email: { type: "string" },
    yes: { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const UPSTREAM = /github\.com[/:]didntchooseaname\/lisible(\.git)?$/;

/**
 * A clone of the upstream repository keeps its origin pointing at the
 * framework itself, which is almost never what a blog author wants. Offer to
 * rename it to upstream so their own repository can become origin.
 */
async function checkUpstreamOrigin(ask?: (q: string, def?: string) => Promise<string>) {
  const remote = Bun.spawnSync(["git", "remote", "get-url", "origin"], { cwd: root });
  if (remote.exitCode !== 0) return;
  const url = remote.stdout.toString().trim();
  if (!UPSTREAM.test(url)) return;
  if (!ask) {
    info('\nNote: your git remote "origin" points at the upstream Lisible repository.');
    info("Consider: git remote rename origin upstream");
    return;
  }
  info('\nYour git remote "origin" points at the upstream Lisible repository.');
  const rename = (await ask('Rename it to "upstream" so your own repo can be origin? (y/n)', "y"))
    .toLowerCase()
    .startsWith("y");
  if (!rename) return;
  const result = Bun.spawnSync(["git", "remote", "rename", "origin", "upstream"], { cwd: root });
  if (result.exitCode === 0) info("  Renamed: origin is now upstream.");
  else info("  Could not rename the remote, do it manually: git remote rename origin upstream");
}

function banner() {
  stdout.write(
    "\n  Lisible\n" +
      "  A minimal, fast blog framework built for reading.\n" +
      "  Interactive setup. Press Enter to accept the value in brackets.\n\n",
  );
}

function info(msg: string) {
  stdout.write(`${msg}\n`);
}

async function main() {
  const assumeYes = flags.yes === true;
  if (!assumeYes && !stdin.isTTY) {
    info("Run this in an interactive terminal: bun run init");
    info('Or run non-interactively: bun run init --yes --variant organique --title "My blog"');
    info('Or edit lisible.config.json directly (field "variant").');
    exit(1);
  }

  if (flags.accent !== undefined && !HEX.test(flags.accent)) {
    info(`Invalid --accent "${flags.accent}": expected a hex color like #22C55E.`);
    exit(1);
  }

  let rl: ReturnType<typeof createInterface> | undefined;
  let ask: (q: string, def?: string) => Promise<string>;
  if (assumeYes) {
    ask = async (_q, def = "") => def;
  } else {
    banner();
    rl = createInterface({ input: stdin, output: stdout });
    const prompt = rl;
    ask = async (q, def = "") => {
      const suffix = def ? ` [${def}]` : "";
      const a = (await prompt.question(`${q}${suffix}: `)).trim();
      return a || def;
    };
  }
  const closePrompt = () => rl?.close();

  await checkUpstreamOrigin(assumeYes ? undefined : ask);

  let variant: string = "organique";
  if (assumeYes) {
    const requested = flags.variant ?? "organique";
    const chosen = VARIANTS.find((v) => v.id === requested);
    if (!chosen) {
      info(`Unknown variant "${requested}". Available: ${VARIANTS.map((v) => v.id).join(", ")}`);
      exit(1);
    }
    variant = chosen.id;
  } else {
    info("\nChoose a variant:");
    VARIANTS.forEach((v, i) => info(`  ${i + 1}. ${v.id}  (${v.label})`));
    const defaultChoice = flags.variant ?? "5";
    while (true) {
      const raw = await ask("\nVariant number or name", defaultChoice);
      const byIndex = VARIANTS[Number(raw) - 1];
      const byName = VARIANTS.find((v) => v.id === raw);
      const chosen = byIndex || byName;
      if (chosen) {
        variant = chosen.id;
        break;
      }
      info("  Unknown variant, try again.");
    }
  }
  const variantDir = join(root, "versions", variant);
  if (!existsSync(variantDir)) {
    info(`\nVariant "${variant}" is missing from versions/. Aborting.`);
    exit(1);
  }

  // Flags imply detailed mode for the values they carry, in both modes.
  const socialFlagged =
    flags.github !== undefined ||
    flags.bluesky !== undefined ||
    flags.mastodon !== undefined ||
    flags.linkedin !== undefined ||
    flags.email !== undefined;
  const flagged =
    flags.author !== undefined ||
    flags.accent !== undefined ||
    flags.repo !== undefined ||
    socialFlagged;
  let detailed = flagged;
  if (!assumeYes && !flagged) {
    const mode = (await ask("\nSetup mode: (q)uick or (d)etailed", "q")).toLowerCase();
    detailed = mode.startsWith("d");
  }

  const title = await ask("\nSite title", flags.title ?? SITE_DEFAULTS.title);
  const url = await ask("Site URL", flags.url ?? "https://example.com");
  let author = flags.author ?? DEMO_PROFILE.name;
  let accent = flags.accent ?? SITE_DEFAULTS.accent;
  let repoUrl = flags.repo ?? "";
  const social = {
    github: flags.github ?? "",
    bluesky: flags.bluesky ?? "",
    mastodon: flags.mastodon ?? "",
    linkedin: flags.linkedin ?? "",
    email: flags.email ?? "",
  };
  if (detailed && !assumeYes) {
    author = await ask("Author name (also replaces the demo profile)", author);
    while (true) {
      const a = await ask("Accent color (hex)", accent);
      if (HEX.test(a)) {
        accent = a;
        break;
      }
      info("  Expected a hex color like #22C55E.");
    }
    repoUrl = await ask('Blog repository URL for "Edit on GitHub" (optional)', repoUrl);
    info("\nSocial links, shown in the footer and metadata. Leave empty to hide one.");
    social.github = await ask("  GitHub profile URL", social.github);
    social.bluesky = await ask("  Bluesky profile URL", social.bluesky);
    social.mastodon = await ask("  Mastodon profile URL", social.mastodon);
    social.linkedin = await ask("  LinkedIn profile URL", social.linkedin);
    social.email = await ask("  Contact email (mailto: added if missing)", social.email);
  }
  if (social.email && !social.email.startsWith("mailto:")) {
    social.email = `mailto:${social.email}`;
  }

  info("\nSummary");
  info(`  variant : ${variant}`);
  info(`  title   : ${title}`);
  info(`  url     : ${url}`);
  if (detailed) {
    info(`  author  : ${author}`);
    info(`  accent  : ${accent}`);
    info(`  repo    : ${repoUrl || "(none)"}`);
    const links = Object.entries(social)
      .filter(([, value]) => value)
      .map(([key]) => key);
    info(`  social  : ${links.length > 0 ? links.join(", ") : "(none)"}`);
  }
  if (!assumeYes) {
    const ok = (await ask("\nApply this configuration? (y/n)", "y")).toLowerCase().startsWith("y");
    if (!ok) {
      info("Cancelled, nothing was written.");
      closePrompt();
      exit(0);
    }
  }

  info(`\nPreparing the "${variant}" variant...`);
  // force: init is a fresh start, so always refresh the workspace install,
  // which covers the shared core and every variant in one pass.
  const rootInstallExitCode = installRootDependencies(root, { force: true });
  if (rootInstallExitCode !== 0) {
    info("  Configuration unchanged. Fix the error, then run bun run init again.");
    closePrompt();
    exit(rootInstallExitCode);
  }

  writeConfig({
    variant,
    title,
    url,
    author: detailed ? author : undefined,
    accent: detailed ? accent : undefined,
    repoUrl: detailed ? repoUrl : undefined,
    social: detailed || socialFlagged ? social : undefined,
  });

  const syncOg = Bun.spawnSync(["bun", "scripts/sync-og-assets.ts"], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (syncOg.exitCode !== 0) {
    info("  The configuration was written, but Open Graph assets could not be regenerated.");
    info("  Fix the error, then run bun run sync-og-assets.");
    closePrompt();
    exit(syncOg.exitCode);
  }

  info("\nDone.");
  info(`  Active variant: ${variant}`);
  info("  Next steps:");
  info("    bun run dev          start the dev server");
  info("    bun run build        build the static site");
  info("    bun run new-post     scaffold an article in both locales");
  info("    bun run check:all    build and verify every variant");
  info("    bun run preview:all  install, build and compare every variant");
  info(
    "\n  Fine-tune shared settings in lisible.config.json (autocompleted from its JSON schema)" +
      "\n  and theme copy in versions/" +
      variant +
      "/src/i18n/ui.ts.\n",
  );
  closePrompt();
  exit(0);
}

function writeConfig(vals: {
  variant: string;
  title: string;
  url: string;
  author?: string;
  accent?: string;
  repoUrl?: string;
  social?: Record<string, string>;
}) {
  let json: any = {};
  if (existsSync(configPath)) {
    try {
      json = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      json = {};
    }
  }
  json.$schema ??= "./docs/lisible.config.schema.json";
  json.lisibleVersion = SITE_DEFAULTS.framework.version;
  json.variant = vals.variant;
  json.site = { ...json.site, title: vals.title, url: vals.url };
  if (vals.author !== undefined) json.site.author = vals.author;
  if (vals.accent !== undefined) json.site.accent = vals.accent;
  if (vals.repoUrl) json.repo = { ...json.repo, url: vals.repoUrl };
  if (vals.social) {
    // Only write filled links: absent keys fall back to the defaults, and the
    // defaults are empty, so untouched entries simply stay hidden.
    const entries = Object.entries(vals.social).filter(([, value]) => value);
    if (entries.length > 0) json.social = { ...json.social, ...Object.fromEntries(entries) };
  }
  writeFileSync(configPath, `${JSON.stringify(json, null, 2)}\n`);
}

main();
