import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * End to end smoke of the scaffolding scripts, in a disposable copy: the
 * scripts resolve lisible.config.json upward from cwd and write next to
 * themselves, so a real run must never touch the repository.
 */

const repo = join(import.meta.dirname, "../..");
let sandbox: string;

function run(args: string[], options: { cwd?: string } = {}) {
  const result = Bun.spawnSync(["bun", ...args], {
    cwd: options.cwd ?? sandbox,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, CI: "" },
  });
  return {
    code: result.exitCode,
    out: result.stdout.toString() + result.stderr.toString(),
  };
}

beforeAll(() => {
  sandbox = mkdtempSync(join(tmpdir(), "lisible-smoke-"));
  cpSync(join(repo, "scripts"), join(sandbox, "scripts"), { recursive: true });
  cpSync(join(repo, "shared"), join(sandbox, "shared"), { recursive: true });
  mkdirSync(join(sandbox, "versions/organique"), { recursive: true });
  Bun.write(
    join(sandbox, "package.json"),
    JSON.stringify({ name: "lisible-smoke", private: true, version: "0.0.0" }),
  );
  Bun.write(join(sandbox, "lisible.config.json"), JSON.stringify({ variant: "organique" }));
});

afterAll(() => {
  rmSync(sandbox, { recursive: true, force: true });
});

describe("new-post", () => {
  it("scaffolds a bilingual pair with valid frontmatter", () => {
    const { code, out } = run([
      "scripts/new-post.ts",
      "article-de-test",
      "--translate",
      "--title",
      "Un titre",
    ]);
    expect(out).toContain("article-de-test");
    expect(code).toBe(0);

    const fr = join(sandbox, "shared/content/blog/fr/article-de-test.mdx");
    const en = join(sandbox, "shared/content/blog/en/article-de-test.mdx");
    expect(existsSync(fr)).toBe(true);
    expect(existsSync(en)).toBe(true);

    const frSource = readFileSync(fr, "utf8");
    expect(frSource).toContain('title: "Un titre"');
    expect(frSource).toContain("draft: true");
    expect(frSource).toContain("pubDate:");
  });

  it("refuses to overwrite an existing post", () => {
    const first = run(["scripts/new-post.ts", "doublon"]);
    expect(first.code).toBe(0);
    const second = run(["scripts/new-post.ts", "doublon"]);
    expect(second.code).not.toBe(0);
  });

  it("fails without a slug", () => {
    const { code } = run(["scripts/new-post.ts"]);
    expect(code).not.toBe(0);
  });
});

describe("init", () => {
  it("rejects an invalid accent before touching anything", () => {
    const { code, out } = run([
      "scripts/init.ts",
      "--yes",
      "--variant",
      "organique",
      "--accent",
      "vert",
    ]);
    expect(code).not.toBe(0);
    expect(out).toContain("Invalid --accent");
  });

  it("rejects an unknown variant", () => {
    const { code, out } = run(["scripts/init.ts", "--yes", "--variant", "nope"]);
    expect(code).not.toBe(0);
    expect(out).toContain("Unknown variant");
  });

  it("writes the configuration from flags in non interactive mode", () => {
    // The Open Graph regeneration step may fail in the sandbox (no installed
    // fonts), but the configuration is written before it runs.
    const { out } = run([
      "scripts/init.ts",
      "--yes",
      "--variant",
      "organique",
      "--title",
      "Smoke",
      "--url",
      "https://smoke.example.com",
      "--author",
      "Sam Smoke",
      "--github",
      "https://github.com/example/smoke",
      "--email",
      "sam@example.com",
    ]);
    expect(out).toContain("organique");

    const config = JSON.parse(readFileSync(join(sandbox, "lisible.config.json"), "utf8"));
    expect(config.variant).toBe("organique");
    expect(config.site.title).toBe("Smoke");
    expect(config.site.url).toBe("https://smoke.example.com");
    expect(config.site.author).toBe("Sam Smoke");
    expect(config.social.github).toBe("https://github.com/example/smoke");
    expect(config.social.email).toBe("mailto:sam@example.com");
    expect(config.social.mastodon).toBeUndefined();
  });
});
