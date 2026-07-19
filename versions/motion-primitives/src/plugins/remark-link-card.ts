import * as fs from "node:fs/promises";
import path from "node:path";
import { h } from "hastscript";
import type { Link, Paragraph, Root, Text } from "mdast";
import ogs from "open-graph-scraper";
import type { OgObject } from "open-graph-scraper/types";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";

const CACHE_FILE = path.resolve(".link-card-cache.json");
const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
const THUMB_WIDTH = 200;
const THUMB_HEIGHT = 150;

const isDev = process.env.NODE_ENV === "development";


let cache: Record<string, OgObject | null> | null = null;
let dirty = false;
const inflight = new Map<string, Promise<OgObject | null>>();

async function loadCache(): Promise<void> {
  if (cache !== null) return;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
  } catch {
    cache = {};
  }
}

async function saveCache(): Promise<void> {
  if (!dirty || !cache) return;
  const sorted = Object.fromEntries(
    Object.keys(cache)
      .sort()
      .map((key) => [key, cache![key]]),
  );
  await fs.writeFile(CACHE_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
  dirty = false;
}

async function fetchMetadata(url: string): Promise<OgObject | null> {
  await loadCache();

  const cached = cache?.[url];
  if (cached !== undefined) return cached;

  if (isDev) return null;

  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async (): Promise<OgObject | null> => {
    try {
      const data = await ogs({
        url,
        fetchOptions: { headers: { "user-agent": USER_AGENT } },
        timeout: FETCH_TIMEOUT_MS,
      });

      const result = data.error ? null : data.result;
      cache![url] = result;
      dirty = true;
      return result;
    } catch {
      cache![url] = null;
      dirty = true;
      return null;
    }
  })();

  inflight.set(url, promise);
  promise.finally(() => inflight.delete(url));
  return promise;
}


function getBareLinkUrl(linkNode: Link): URL | null {
  if (
    linkNode.children.length !== 1 ||
    linkNode.children[0].type !== "text" ||
    linkNode.children[0].value !== linkNode.url ||
    /\s/.test(linkNode.url)
  )
    return null;

  let parsed: URL;
  try {
    parsed = new URL(linkNode.url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return parsed;
}


function resolveThumbnail(metadata: OgObject, pageUrl: URL): string {
  const raw =
    metadata.ogImage?.[0]?.url ?? metadata.twitterImage?.[0]?.url ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("//")) return new URL(pageUrl.protocol + trimmed).href;
    if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
    return new URL(trimmed).href;
  } catch {
    return "";
  }
}

function buildCardNode(metadata: OgObject, pageUrl: URL): Text {
  const title = (metadata.ogTitle ?? metadata.twitterTitle ?? "").trim() || pageUrl.hostname;
  const description = (metadata.ogDescription ?? metadata.twitterDescription ?? "").trim();
  const thumbnailSrc = resolveThumbnail(metadata, pageUrl);
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${pageUrl.hostname}&sz=32`;

  return {
    type: "text",
    value: "",
    data: {
      hName: "div",
      hProperties: { class: "link-card-wrap" },
      hChildren: [
        h(
          "a",
          {
            class: "link-card",
            href: pageUrl.href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          [
            h("span", { class: "link-card-info" }, [
              h("span", { class: "link-card-title" }, title),
              ...(description
                ? [h("span", { class: "link-card-description" }, description)]
                : []),
              h("span", { class: "link-card-meta" }, [
                h("img", {
                  class: "link-card-favicon",
                  src: faviconSrc,
                  alt: "",
                  width: 16,
                  height: 16,
                  loading: "lazy",
                  decoding: "async",
                }),
                h("span", { class: "link-card-domain" }, pageUrl.hostname),
              ]),
            ]),
            ...(thumbnailSrc
              ? [
                  h("span", { class: "link-card-thumb" }, [
                    h("img", {
                      class: "link-card-image",
                      src: thumbnailSrc,
                      alt: "",
                      width: THUMB_WIDTH,
                      height: THUMB_HEIGHT,
                      loading: "lazy",
                      decoding: "async",
                    }),
                  ]),
                ]
              : []),
          ],
        ),
      ],
    },
  } as Text;
}


const remarkLinkCard: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = async (tree) => {
    const tasks: Array<() => Promise<void>> = [];

    visit(tree, "paragraph", (paragraphNode: Paragraph, index, parent) => {
      if (
        index === undefined ||
        parent === undefined ||
        parent.type !== "root" ||
        paragraphNode.children.length !== 1 ||
        paragraphNode.data !== undefined
      )
        return;

      const child = paragraphNode.children[0];
      if (child.type !== "link") return;

      const pageUrl = getBareLinkUrl(child);
      if (!pageUrl) return;

      tasks.push(async () => {
        try {
          const metadata = await fetchMetadata(pageUrl.href);
          if (!metadata) return;
          parent.children.splice(index, 1, buildCardNode(metadata, pageUrl));
        } catch {
        }
      });
    });

    await Promise.allSettled(tasks.map((task) => task()));
    await saveCache();
  };

  return transformer;
};

export default remarkLinkCard;
