import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_SLUGS } from "./demo-content";

/**
 * Health check of a Lisible blog: configuration left on placeholder values,
 * demo content still published, broken symlink checkouts and update status.
 * Advisory by default; --strict exits non zero when findings remain, so CI
 * setups can enforce a clean bill.
 *
 *   bun run doctor
 *   bun run doctor --strict
 */

const root = new URL("..", import.meta.url).pathname;
const strict = process.argv.includes("--strict");

const findings: string[] = [];
const infos: string[] = [];

function readJson(path: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

const rootPackage = readJson(join(root, "package.json"));
const config = readJson(join(root, "lisible.config.json"));
const site = (config.site ?? {}) as Record<string, unknown>;
const social = (config.social ?? {}) as Record<string, unknown>;

// 1. Placeholder identity.
const url = typeof site.url === "string" ? site.url : "";
if (!url || url.includes("example.com")) {
  findings.push(
    "site.url still points at a placeholder domain; set your deployed URL in lisible.config.json.",
  );
}
if (!site.title) {
  infos.push("site.title is unset; the framework default title is shown.");
}
if (Object.values(social).every((value) => !value)) {
  infos.push("No social link is configured; the footer only shows the RSS link.");
}

// 2. Demo content still published.
const leftover = DEMO_SLUGS.filter(
  (slug) => slug !== "bienvenue" && existsSync(join(root, `shared/content/blog/fr/${slug}.mdx`)),
);
if (leftover.length > 0) {
  findings.push(
    `${leftover.length} demo article(s) still present (${leftover.slice(0, 3).join(", ")}${
      leftover.length > 3 ? ", ..." : ""
    }); run bun run clean-demo before publishing.`,
  );
}

// 3. Symlink integrity: a checkout without symlink support turns the shared
// routes into small text files holding the target path.
const variant = typeof config.variant === "string" ? config.variant : "organique";
const probe = join(root, `versions/${variant}/src/pages/index.astro`);
if (existsSync(probe)) {
  const stat = lstatSync(probe);
  if (!stat.isSymbolicLink() && stat.size < 200) {
    const head = readFileSync(probe, "utf8").slice(0, 80);
    if (head.includes("shared/routes")) {
      findings.push(
        "The shared routes were checked out as plain text files instead of symlinks. " +
          "On Windows, enable Developer Mode or set git config core.symlinks true, then re-clone.",
      );
    }
  }
}

// 4. Update status.
const localVersion =
  typeof config.lisibleVersion === "string" && config.lisibleVersion
    ? config.lisibleVersion
    : (rootPackage.version as string | undefined);
const upstream = Bun.spawnSync(["git", "remote", "get-url", "upstream"], { cwd: root });
if (upstream.exitCode !== 0) {
  infos.push(
    "No upstream remote: add one to pull framework updates " +
      "(git remote add upstream https://github.com/didntchooseaname/lisible).",
  );
}
try {
  const response = await fetch(
    "https://api.github.com/repos/didntchooseaname/lisible/releases/latest",
    { headers: { accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(5000) },
  );
  if (response.ok) {
    const release = (await response.json()) as { tag_name?: string };
    const latest = release.tag_name?.replace(/^lisible-core-v|^v/, "");
    if (latest && localVersion && latest !== localVersion) {
      findings.push(
        `Framework ${localVersion} is behind the latest release (${latest}); ` +
          "see the changelog at https://github.com/didntchooseaname/lisible/releases.",
      );
    } else if (latest) {
      infos.push(`Framework ${localVersion ?? "unknown"} matches the latest release.`);
    }
  }
} catch {
  infos.push("Release check skipped (offline or GitHub unreachable).");
}

for (const message of infos) console.log(`  i ${message}`);
for (const message of findings) console.log(`  ! ${message}`);
if (findings.length === 0) {
  console.log("\nDoctor: nothing to fix.");
} else {
  console.log(`\nDoctor: ${findings.length} finding(s) above deserve a look.`);
}
process.exit(strict && findings.length > 0 ? 1 : 0);
