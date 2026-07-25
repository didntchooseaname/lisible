/**
 * Locks in the editorial style rules of the repository:
 *
 * - no em dash (U+2014) or en dash (U+2013) anywhere in source or content,
 * - no emoji in markdown documentation (blog demo content is exempt).
 *
 * The list of files comes from git, so generated output and node_modules are
 * never scanned.
 */

const CHECKED_EXTENSIONS = /\.(md|mdx|ts|tsx|astro|json|jsonc|yml|yaml|css)$/;
const LONG_DASH = /[\u2013\u2014]/;
const EMOJI = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|\u{FE0F}/u;

const root = new URL("..", import.meta.url).pathname;

const listing = Bun.spawnSync(["git", "ls-files", "-z"], { cwd: root });
if (listing.exitCode !== 0) {
  console.error("[lisible] check-style: git ls-files failed.");
  process.exit(1);
}
const files = listing.stdout
  .toString()
  .split("\0")
  .filter((path) => CHECKED_EXTENSIONS.test(path));

const problems: string[] = [];

for (const path of files) {
  const file = Bun.file(`${root}/${path}`);
  if (!(await file.exists())) continue;
  const lines = (await file.text()).split("\n");
  const emojiApplies = /\.(md|mdx)$/.test(path) && !path.startsWith("shared/content/");
  lines.forEach((line, index) => {
    if (LONG_DASH.test(line)) {
      problems.push(`${path}:${index + 1}: em or en dash (use a comma, colon or parentheses)`);
    }
    if (emojiApplies && EMOJI.test(line)) {
      problems.push(`${path}:${index + 1}: emoji in documentation`);
    }
  });
}

if (problems.length > 0) {
  console.error(`[lisible] check-style: ${problems.length} problem(s) found:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`[lisible] check-style: ${files.length} files clean.`);
