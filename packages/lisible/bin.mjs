#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const REPOSITORY = "https://github.com/didntchooseaname/lisible";
const shell = process.platform === "win32";

function run(command, args, options = {}) {
  return spawnSync(command, args, { stdio: "inherit", shell, ...options });
}

function has(command) {
  return spawnSync(command, ["--version"], { stdio: "ignore", shell }).status === 0;
}

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: lisible [directory] [init flags]

Creates a new Lisible blog in [directory] (default: my-blog), then runs the
guided setup. Flags after the directory are forwarded to the setup, for a
non-interactive scaffold:

  lisible my-blog --yes --variant organique --title "My blog"

Available variants: motion-primitives, cult-ui, aceternity, reactbits,
organique, h4x0r. Requires git and Bun (https://bun.sh).`);
  process.exit(0);
}

const [first, ...rest] = args;
const hasDirectory = first !== undefined && !first.startsWith("-");
const directoryName = hasDirectory ? first : "my-blog";
const directory = resolve(directoryName);
const initFlags = hasDirectory ? rest : args;

if (!has("git")) fail("git is required. Install it from https://git-scm.com and retry.");
if (!has("bun")) {
  fail("Bun is required. Install it with: curl -fsSL https://bun.sh/install | bash");
}
if (existsSync(directory)) fail(`${directory} already exists. Pick another directory.`);

console.log(`\nCreating a Lisible blog in ${directory}...`);
const clone = run("git", ["clone", "--depth", "1", REPOSITORY, directory]);
if (clone.status !== 0) fail("could not download the template (git clone failed).");

// The template history belongs to the framework, not to the new blog.
await rm(join(directory, ".git"), { recursive: true, force: true });
run("git", ["init"], { cwd: directory });

const init = run("bun", ["run", "init", ...initFlags], { cwd: directory });
if (init.status !== 0) {
  fail("the guided setup did not finish. Run it again inside the directory: bun run init");
}

console.log(`\nDone. Next steps:\n  cd ${directoryName}\n  bun run dev`);
