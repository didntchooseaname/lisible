import { describe, expect, it } from "bun:test";
import { type FixturePost, fixtureById, registerAstroContentMock } from "./helpers/blog-fixtures";

// The mock must be registered before the modules under test are loaded.
registerAstroContentMock();
const { postLocale, postSlug } = await import("../../shared/lib/posts");
const llms = await import("../../shared/lib/llms");

type Post = Parameters<typeof postLocale>[0];
const asPost = (entry: FixturePost) => entry as unknown as Post;

const SITE_URL = "https://example.com";

function postUrl(post: Post): string {
  const prefix = postLocale(post) === "fr" ? "" : "/en";
  return `${prefix}/blog/${postSlug(post)}/`;
}

const INTRO_FR = {
  locale: "fr" as const,
  tagline: "Un framework de blog minimaliste et rapide, pensé pour la lecture.",
  description: "Description du site de test.",
};
const INTRO_EN = {
  locale: "en" as const,
  tagline: "A minimal, fast blog framework, built for reading.",
  description: "Test site description.",
};

const OPTIONS = {
  siteTitle: "Lisible",
  intro: [INTRO_FR, INTRO_EN],
  siteUrl: SITE_URL,
  locales: ["fr", "en"] as const,
  postUrl,
};

describe("markdownPath", () => {
  it("serves French posts at the root and English ones under /en", () => {
    expect(llms.markdownPath(asPost(fixtureById("post-a.mdx")))).toBe("/blog/post-a.mdx.md");
    expect(llms.markdownPath(asPost(fixtureById("en/post-a.mdx")))).toBe("/en/blog/post-a.mdx.md");
  });
});

describe("postToMarkdown", () => {
  it("renders title, description, metadata and body with French labels", () => {
    const post = fixtureById("post-b.mdx");
    const markdown = llms.postToMarkdown(asPost(post), SITE_URL, postUrl(asPost(post)));

    expect(markdown.startsWith("# Accessibilité pratique\n")).toBe(true);
    expect(markdown).toContain("> Rendre un blog accessible.");
    expect(markdown).toContain("Date: 2026-05-02");
    expect(markdown).toContain("Mise à jour: 2026-05-10");
    expect(markdown).toContain("Tags: Accessibilité");
    expect(markdown).toContain(`URL: ${SITE_URL}/blog/post-b.mdx/`);
    expect(markdown).toContain("\n---\n");
    expect(markdown).toContain(post.body);
  });

  it("uses English labels for English posts", () => {
    const post = fixtureById("en/post-z.mdx");
    const markdown = llms.postToMarkdown(asPost(post), SITE_URL, postUrl(asPost(post)));

    expect(markdown).toContain("Date: 2026-02-01");
    expect(markdown).toContain("Updated: 2026-02-05");
    expect(markdown).toContain(`URL: ${SITE_URL}/en/blog/post-z.mdx/`);
  });

  it("omits the metadata lines that have no value", () => {
    const post = fixtureById("fr/post-d.mdx");
    const markdown = llms.postToMarkdown(asPost(post), SITE_URL, postUrl(asPost(post)));

    expect(markdown).not.toContain("Mise à jour:");
    expect(markdown).not.toContain("Tags:");
  });
});

describe("buildLlmsIndex", () => {
  it("opens with the site title and one tagline block per locale", async () => {
    const index = await llms.buildLlmsIndex(OPTIONS);
    expect(
      index.startsWith(
        `# Lisible\n\n> ${INTRO_FR.tagline}\n\n${INTRO_FR.description}\n\n` +
          `> ${INTRO_EN.tagline}\n\n${INTRO_EN.description}`,
      ),
    ).toBe(true);
  });

  it("lists both locales in order with one section each", async () => {
    const index = await llms.buildLlmsIndex(OPTIONS);
    const fr = index.indexOf("## Articles (FR)");
    const en = index.indexOf("## Articles (EN)");
    expect(fr).toBeGreaterThan(-1);
    expect(en).toBeGreaterThan(fr);
  });

  it("links every post to its Markdown companion on the site origin", async () => {
    const index = await llms.buildLlmsIndex(OPTIONS);
    expect(index).toContain(
      `- [Premier article](${SITE_URL}/blog/post-a.mdx.md): Les bases du framework.`,
    );
    expect(index).toContain(`- [First post](${SITE_URL}/en/blog/post-a.mdx.md): Framework basics.`);

    const bullets = index.split("\n").filter((line) => line.startsWith("- ["));
    expect(bullets).toHaveLength(7);
    for (const bullet of bullets) {
      expect(bullet).toMatch(/\]\(https:\/\/example\.com\/.*\.md\): /);
    }
  });
});

describe("buildLlmsFull", () => {
  it("concatenates every post as Markdown, separated by rules", async () => {
    const full = await llms.buildLlmsFull(OPTIONS);

    expect(full.startsWith(`# Lisible\n\n> ${INTRO_FR.tagline}\n\n> ${INTRO_EN.tagline}\n`)).toBe(
      true,
    );
    expect(full).toContain("# Premier article");
    expect(full).toContain("# First post");
    expect(full).toContain(fixtureById("post-a.mdx").body);
    expect(full).toContain(`URL: ${SITE_URL}/blog/post-a.mdx/`);

    // One horizontal rule inside each post block plus one after it.
    const rules = full.split("\n").filter((line) => line === "---");
    expect(rules.length).toBe(14);
  });
});
