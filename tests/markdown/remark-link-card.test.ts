import { describe, expect, it } from "bun:test";
import type { OgObject } from "open-graph-scraper/types";
import {
  createRemarkLinkCard,
  type LinkCardCacheApi,
  type RemarkLinkCardOptions,
} from "../../shared/markdown/remark-link-card";
import { mdToHtml } from "./helpers";

/**
 * In-memory cache double: pre-populated entries make the plugin fully
 * offline (a cache hit short-circuits the network fetch), so the tests
 * exercise the markup and gating contracts without touching ogs.
 */
function memoryCache(entries: Record<string, OgObject | null> = {}) {
  const store = new Map<string, OgObject | null>(Object.entries(entries));
  const inflight = new Map<string, Promise<OgObject | null>>();
  let saved = 0;
  const api: LinkCardCacheApi = {
    loadCache: () => Promise.resolve(),
    getCachedMetadata: (url) => (store.has(url) ? store.get(url) : undefined),
    setCachedMetadata: (url, metadata) => void store.set(url, metadata),
    getInflight: (url) => inflight.get(url),
    setInflight: (url, promise) => void inflight.set(url, promise),
    saveCache: () => {
      saved += 1;
      return Promise.resolve();
    },
  };
  return { api, store, saves: () => saved };
}

const classNames = {
  wrap: "link-card-wrap",
  card: "link-card",
  info: "lc-info",
  title: "lc-title",
  description: "lc-description",
  meta: "lc-meta",
  favicon: "lc-favicon",
  domain: "lc-domain",
  thumbnail: "lc-thumb",
  image: "lc-image",
};

const base: RemarkLinkCardOptions = {
  classNames,
  blockTag: "span",
  thumbWidth: 240,
  thumbHeight: 120,
  faviconSize: 32,
  imgDecoding: true,
  renderEmptyDescription: false,
  titleFallback: "og-twitter",
  descriptionFallback: "og-twitter",
  trimText: true,
  thumbnailAlt: true,
  thumbnailStrategy: "each",
  normalizeThumbnailUrl: true,
  urlValidation: "regex",
  linkDetection: "direct",
  useRawUrl: false,
  useAbortController: true,
  isDev: () => false,
};

const URL_A = "https://exemple.fr/article";

const META: OgObject = {
  ogTitle: "  Un article  ",
  ogDescription: " La description. ",
  ogImage: [{ url: "/cover.png", alt: "Couverture" }],
} as OgObject;

const render = (
  md: string,
  overrides: Partial<RemarkLinkCardOptions> = {},
  entries: Record<string, OgObject | null> = { [URL_A]: META },
) => {
  const cache = memoryCache(entries);
  return mdToHtml(md, [createRemarkLinkCard({ ...base, ...overrides, cache: cache.api })]);
};

describe("createRemarkLinkCard", () => {
  it("renders a bare paragraph link as the full card markup", async () => {
    const html = await render(URL_A);
    expect(html).toBe(
      '<div class="link-card-wrap">' +
        '<a class="link-card" href="https://exemple.fr/article" target="_blank" rel="noopener noreferrer">' +
        '<span class="lc-info">' +
        '<span class="lc-title">Un article</span>' +
        '<span class="lc-description">La description.</span>' +
        '<span class="lc-meta">' +
        '<img class="lc-favicon" src="https://www.google.com/s2/favicons?domain=exemple.fr&#x26;sz=32" alt="" width="16" height="16" loading="lazy" decoding="async">' +
        '<span class="lc-domain">exemple.fr</span>' +
        "</span></span>" +
        '<span class="lc-thumb">' +
        '<img class="lc-image" src="https://exemple.fr/cover.png" alt="Couverture" width="240" height="120" loading="lazy" decoding="async">' +
        "</span></a></div>",
    );
  });

  it("keeps the plain link when metadata is cached as a failure", async () => {
    const html = await render(URL_A, {}, { [URL_A]: null });
    expect(html).toBe(`<p><a href="${URL_A}">${URL_A}</a></p>`);
  });

  it("keeps the plain link in dev when the url is not cached", async () => {
    const html = await render(URL_A, { isDev: () => true }, {});
    expect(html).toBe(`<p><a href="${URL_A}">${URL_A}</a></p>`);
  });

  it("only matches bare links whose text is exactly the url", async () => {
    expect(await render(`[titre](${URL_A})`)).toContain("<p><a");
    expect(await render(`avant ${URL_A}`)).not.toContain("link-card");
    expect(await render(`${URL_A} après`)).not.toContain("link-card");
  });

  it("ignores links nested deeper unless linkDetection is nested", async () => {
    const md = `**${URL_A}**`;
    expect(await render(md)).not.toContain("link-card");
    expect(await render(md, { linkDetection: "nested" })).toContain("link-card-wrap");
  });

  describe("url validation", () => {
    // Explicit [url](url) links keep the text equal to the url, which is the
    // bare link shape, while bypassing the gfm autolink domain restrictions.
    const bare = (url: string) => `[${url}](${url})`;

    it("regex mode rejects urls whose path does not start with a slash", async () => {
      const url = "https://exemple.fr?q=1";
      expect(await render(bare(url), {}, { [url]: META })).not.toContain("link-card");
    });

    it("protocol mode accepts them but rejects other protocols", async () => {
      const options = { urlValidation: "protocol" as const };
      expect(
        await render(bare("https://exemple.fr?q=1"), options, {
          "https://exemple.fr/?q=1": META,
        }),
      ).toContain("link-card-wrap");
      expect(await render(bare("ftp://exemple.fr/f"), options, {})).not.toContain("link-card");
    });
  });

  it("uses the raw markdown url when useRawUrl is set", async () => {
    const raw = "https://exemple.fr";
    const withRaw = await render(raw, { useRawUrl: true }, { [raw]: META });
    expect(withRaw).toContain('href="https://exemple.fr"');

    const normalized = await render(raw, {}, { "https://exemple.fr/": META });
    expect(normalized).toContain('href="https://exemple.fr/"');
  });

  describe("markup axes", () => {
    it("renders div blocks and keeps empty descriptions when configured", async () => {
      const html = await render(
        URL_A,
        { blockTag: "div", renderEmptyDescription: true },
        { [URL_A]: { ogTitle: "T" } as OgObject },
      );
      expect(html).toContain('<div class="lc-title">T</div>');
      expect(html).toContain('<div class="lc-description"></div>');
      expect(html).not.toContain("lc-thumb");
    });

    it("drops the description element when empty by default", async () => {
      const html = await render(URL_A, {}, { [URL_A]: { ogTitle: "T" } as OgObject });
      expect(html).not.toContain("lc-description");
    });

    it("falls back to the hostname when the title is blank", async () => {
      const html = await render(URL_A, {}, { [URL_A]: { ogTitle: "   " } as OgObject });
      expect(html).toContain('<span class="lc-title">exemple.fr</span>');
    });

    it("og fallback ignores twitter fields", async () => {
      const meta = { twitterTitle: "Tw", twitterDescription: "TwD" } as OgObject;
      const html = await render(
        URL_A,
        { titleFallback: "og", descriptionFallback: "og" },
        { [URL_A]: meta },
      );
      expect(html).toContain('<span class="lc-title">exemple.fr</span>');
      const fallback = await render(URL_A, {}, { [URL_A]: meta });
      expect(fallback).toContain('<span class="lc-title">Tw</span>');
    });

    it("omits decoding when imgDecoding is off", async () => {
      const html = await render(URL_A, { imgDecoding: false });
      expect(html).not.toContain("decoding");
    });

    it("hides the thumbnail alt when thumbnailAlt is off", async () => {
      const html = await render(URL_A, { thumbnailAlt: false });
      expect(html).toContain('<img class="lc-image" src="https://exemple.fr/cover.png" alt=""');
    });
  });

  describe("thumbnail resolution", () => {
    it("each strategy falls back from og to twitter and resolves urls", async () => {
      const meta = {
        ogImage: [{ url: "  " }],
        twitterImage: [{ url: "//cdn.exemple.fr/t.png", alt: "Alt tw" }],
      } as OgObject;
      const html = await render(URL_A, {}, { [URL_A]: meta });
      expect(html).toContain('src="https://cdn.exemple.fr/t.png" alt="Alt tw"');
    });

    it("first strategy picks the first raw url and drops the alt", async () => {
      const meta = {
        ogImage: [{ url: "/only.png", alt: "ignorée" }],
      } as OgObject;
      const html = await render(URL_A, { thumbnailStrategy: "first" }, { [URL_A]: meta });
      expect(html).toContain('src="https://exemple.fr/only.png" alt=""');
    });

    it("normalizeThumbnailUrl rejects invalid absolute urls", async () => {
      const meta = { ogImage: [{ url: "http://" }] } as OgObject;
      const html = await render(URL_A, {}, { [URL_A]: meta });
      expect(html).not.toContain("lc-thumb");
      const kept = await render(URL_A, { normalizeThumbnailUrl: false }, { [URL_A]: meta });
      expect(kept).toContain('src="http://"');
    });
  });

  it("saves the cache once per run", async () => {
    const cache = memoryCache({ [URL_A]: META });
    await mdToHtml(URL_A, [createRemarkLinkCard({ ...base, cache: cache.api })]);
    expect(cache.saves()).toBe(1);
  });
});
