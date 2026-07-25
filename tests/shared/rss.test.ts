import { describe, expect, it } from "bun:test";
import { registerAstroContentMock } from "./helpers/blog-fixtures";

// The mock must be registered before the modules under test are loaded.
registerAstroContentMock();
const { postLocale, postSlug } = await import("../../shared/lib/posts");
const rssLib = await import("../../shared/lib/rss");

type Post = Parameters<typeof postLocale>[0];
type Context = Parameters<typeof rssLib.localeRss>[0];

const SITE_URL = "https://example.com";

function postUrl(post: Post): string {
  const prefix = postLocale(post) === "fr" ? "" : "/en";
  return `${prefix}/blog/${postSlug(post)}/`;
}

function makeContext(site: URL | undefined): Context {
  return { site } as unknown as Context;
}

function makeOptions(overrides: { styled?: boolean } = {}) {
  return {
    title: "Lisible (flux)",
    description: "Flux de test.",
    siteUrl: SITE_URL,
    styled: overrides.styled ?? true,
    postUrl,
  };
}

describe("RSS_STYLESHEET_PATH", () => {
  it("matches the path the stylesheet route serves", () => {
    expect(rssLib.RSS_STYLESHEET_PATH).toBe("/rss/feed.xsl");
  });
});

describe("localeRss", () => {
  it("returns an XML response with one item per published post", async () => {
    const response = await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions());

    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get("Content-Type") ?? "").toContain("xml");

    const xml = await response.text();
    expect(xml).toContain("<rss");
    // Drafts are not filtered under bun test (PROD is undefined), so the
    // five French fixtures, draft included, all become items.
    expect(xml.split("<item>").length - 1).toBe(5);
    expect(xml).toContain("Lisible (flux)");
    expect(xml).toContain("Flux de test.");
    expect(xml).toContain("<pubDate>");
  });

  it("orders items by pubDate descending", async () => {
    const response = await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions());
    const xml = await response.text();

    const positions = [
      "Brouillon en cours",
      "Accessibilité pratique",
      "Épilogue de série",
      "Premier article",
      "Architecture de base",
    ].map((title) => xml.indexOf(title));

    expect(positions.every((index) => index > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("resolves links against the context site", async () => {
    const response = await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions());
    const xml = await response.text();
    expect(xml).toContain(`<link>${SITE_URL}/blog/post-a.mdx/</link>`);
  });

  it("declares the feed language", async () => {
    const fr = await (
      await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions())
    ).text();
    expect(fr).toContain("<language>fr</language>");

    const en = await (
      await rssLib.localeRss(makeContext(new URL(SITE_URL)), "en", makeOptions())
    ).text();
    expect(en).toContain("<language>en</language>");
    expect(en.split("<item>").length - 1).toBe(2);
    expect(en).toContain(`<link>${SITE_URL}/en/blog/post-a.mdx/</link>`);
  });

  it("references the stylesheet only when styled", async () => {
    const styled = await (
      await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions())
    ).text();
    expect(styled).toContain("xml-stylesheet");
    expect(styled).toContain(rssLib.RSS_STYLESHEET_PATH);

    const bare = await (
      await rssLib.localeRss(makeContext(new URL(SITE_URL)), "fr", makeOptions({ styled: false }))
    ).text();
    expect(bare).not.toContain("xml-stylesheet");
  });

  it("falls back to options.siteUrl when the context has no site", async () => {
    const response = await rssLib.localeRss(makeContext(undefined), "fr", makeOptions());
    const xml = await response.text();
    expect(xml).toContain(`<link>${SITE_URL}/blog/post-a.mdx/</link>`);
  });
});
