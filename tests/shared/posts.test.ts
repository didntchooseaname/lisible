import { describe, expect, it } from "bun:test";
import {
  FIXTURE_POSTS,
  type FixturePost,
  fixtureById,
  registerAstroContentMock,
} from "./helpers/blog-fixtures";

// The mock must be registered before posts.ts is loaded, hence the dynamic import.
registerAstroContentMock();
const posts = await import("../../shared/lib/posts");

type Post = Parameters<typeof posts.postLocale>[0];
const asPost = (entry: FixturePost) => entry as unknown as Post;

describe("postLocale", () => {
  it("detects English posts by their id prefix", () => {
    expect(posts.postLocale(asPost(fixtureById("en/post-a.mdx")))).toBe("en");
  });

  it("treats everything else as French", () => {
    expect(posts.postLocale(asPost(fixtureById("post-a.mdx")))).toBe("fr");
    expect(posts.postLocale(asPost(fixtureById("fr/post-d.mdx")))).toBe("fr");
  });
});

describe("postSlug", () => {
  it("strips the locale prefix", () => {
    expect(posts.postSlug(asPost(fixtureById("en/post-a.mdx")))).toBe("post-a.mdx");
    expect(posts.postSlug(asPost(fixtureById("fr/post-d.mdx")))).toBe("post-d.mdx");
  });

  it("leaves unprefixed ids untouched", () => {
    expect(posts.postSlug(asPost(fixtureById("post-a.mdx")))).toBe("post-a.mdx");
  });
});

describe("otherLocale", () => {
  it("flips between fr and en", () => {
    expect(posts.otherLocale("fr")).toBe("en");
    expect(posts.otherLocale("en")).toBe("fr");
  });
});

describe("getPublishedPosts", () => {
  it("keeps only the requested locale, sorted by pubDate descending", async () => {
    const fr = await posts.getPublishedPosts("fr");
    expect(fr.map((post) => post.id)).toEqual([
      "fr/post-d.mdx",
      "post-b.mdx",
      "post-e.mdx",
      "post-a.mdx",
      "post-c.mdx",
    ]);

    const en = await posts.getPublishedPosts("en");
    expect(en.map((post) => post.id)).toEqual(["en/post-a.mdx", "en/post-z.mdx"]);
  });

  it("keeps drafts because import.meta.env.PROD is undefined under bun test", async () => {
    // The production draft filter only runs when Astro builds with PROD set.
    // bun test runs in a dev-like environment, so the draft fixture stays.
    const fr = await posts.getPublishedPosts("fr");
    expect(fr.some((post) => post.data.draft)).toBe(true);
  });
});

describe("groupByYear", () => {
  it("groups posts by pubDate year, most recent year first", async () => {
    const recent = await posts.getPublishedPosts("fr");
    const older = asPost({
      ...fixtureById("post-a.mdx"),
      id: "archive.mdx",
      data: { ...fixtureById("post-a.mdx").data, pubDate: new Date("2025-08-01T12:00:00Z") },
    });

    const groups = posts.groupByYear([...recent, older]);
    expect(groups.map(([year]) => year)).toEqual([2026, 2025]);
    expect(groups[0][1]).toHaveLength(recent.length);
    expect(groups[1][1].map((post) => post.id)).toEqual(["archive.mdx"]);
  });
});

describe("slugifyTag", () => {
  it("lowercases and strips accents", () => {
    expect(posts.slugifyTag("Accessibilité")).toBe("accessibilite");
    expect(posts.slugifyTag("Édition Web")).toBe("edition-web");
  });

  it("maps aliases to their canonical slug via the taxonomy", () => {
    expect(posts.slugifyTag("Typography")).toBe("typographie");
    expect(posts.slugifyTag("Accessibility")).toBe("accessibilite");
  });
});

describe("getAllTags", () => {
  it("counts and sorts tags, count first then name", async () => {
    const tags = await posts.getAllTags("fr");
    expect(tags.map((tag) => [tag.slug, tag.count])).toEqual([
      ["astro", 2],
      ["performance", 2],
      ["accessibilite", 1],
    ]);
    expect(tags[2].name).toBe("Accessibilité");
  });
});

describe("getPostsByTag", () => {
  it("matches posts through the slugified tag", async () => {
    const tagged = await posts.getPostsByTag("fr", "astro");
    expect(tagged.map((post) => post.id)).toEqual(["post-a.mdx", "post-c.mdx"]);
  });

  it("matches the English alias of a canonical slug", async () => {
    const tagged = await posts.getPostsByTag("en", "accessibilite");
    expect(tagged.map((post) => post.id)).toEqual(["en/post-a.mdx"]);
  });
});

describe("getAdjacentPosts", () => {
  it("returns chronological neighbours within the locale", async () => {
    const { older, newer } = await posts.getAdjacentPosts(asPost(fixtureById("post-e.mdx")));
    expect(newer?.id).toBe("post-b.mdx");
    expect(older?.id).toBe("post-a.mdx");
  });

  it("has no newer neighbour for the most recent post", async () => {
    const { older, newer } = await posts.getAdjacentPosts(asPost(fixtureById("fr/post-d.mdx")));
    expect(newer).toBeUndefined();
    expect(older?.id).toBe("post-b.mdx");
  });

  it("returns nothing for a post outside the collection", async () => {
    const stranger = asPost({
      ...fixtureById("post-a.mdx"),
      id: "inconnu.mdx",
    });
    const { older, newer } = await posts.getAdjacentPosts(stranger);
    expect(older).toBeUndefined();
    expect(newer).toBeUndefined();
  });
});

describe("getRelatedPosts", () => {
  it("ranks by shared tags, most recent first on ties", async () => {
    // post-a is tagged Astro and Performance. post-c shares Astro, post-e
    // shares Performance, both score 1/2, so pubDate breaks the tie.
    const related = await posts.getRelatedPosts(asPost(fixtureById("post-a.mdx")));
    expect(related.map((post) => post.id)).toEqual(["post-e.mdx", "post-c.mdx"]);
  });

  it("returns an empty list for posts without tags", async () => {
    const related = await posts.getRelatedPosts(asPost(fixtureById("fr/post-d.mdx")));
    expect(related).toEqual([]);
  });

  it("honours the limit", async () => {
    const related = await posts.getRelatedPosts(asPost(fixtureById("post-a.mdx")), 1);
    expect(related.map((post) => post.id)).toEqual(["post-e.mdx"]);
  });
});

describe("getTranslation", () => {
  it("pairs posts by identical filename under the other locale", async () => {
    const enTwin = await posts.getTranslation(asPost(fixtureById("post-a.mdx")));
    expect(enTwin?.id).toBe("en/post-a.mdx");

    const frTwin = await posts.getTranslation(asPost(fixtureById("en/post-a.mdx")));
    expect(frTwin?.id).toBe("post-a.mdx");
  });

  it("returns undefined when no translation exists", async () => {
    const twin = await posts.getTranslation(asPost(fixtureById("post-b.mdx")));
    expect(twin).toBeUndefined();
  });
});

describe("series helpers", () => {
  const slug = "architecture-web-moderne";

  it("slugifies series names", () => {
    expect(posts.seriesSlug("Architecture web moderne")).toBe(slug);
    expect(posts.seriesSlug("Série accentuée !")).toBe("serie-accentuee");
  });

  it("orders series posts by seriesOrder, then chronologically", async () => {
    // post-e has no seriesOrder, so it falls back after the explicit orders.
    const series = await posts.getSeriesPosts("fr", slug);
    expect(series.map((post) => post.id)).toEqual(["post-c.mdx", "post-b.mdx", "post-e.mdx"]);
  });

  it("lists every series of a locale with its posts", async () => {
    const all = await posts.getAllSeries("fr");
    expect(all).toHaveLength(1);
    expect(all[0].slug).toBe(slug);
    expect(all[0].name).toBe("Architecture web moderne");
    expect(all[0].posts).toHaveLength(3);
  });

  it("builds the navigation context of a series member", async () => {
    const context = await posts.getSeriesContext(asPost(fixtureById("post-b.mdx")));
    expect(context?.slug).toBe(slug);
    expect(context?.index).toBe(1);
    expect(context?.prev?.id).toBe("post-c.mdx");
    expect(context?.next?.id).toBe("post-e.mdx");
  });

  it("returns undefined for posts outside any series", async () => {
    const context = await posts.getSeriesContext(asPost(fixtureById("post-a.mdx")));
    expect(context).toBeUndefined();
  });
});

describe("fixtures sanity", () => {
  it("keeps the fixture array order stable across queries", async () => {
    const before = FIXTURE_POSTS.map((post) => post.id);
    await posts.getPublishedPosts("fr");
    await posts.getAllSeries("fr");
    expect(FIXTURE_POSTS.map((post) => post.id)).toEqual(before);
  });
});
