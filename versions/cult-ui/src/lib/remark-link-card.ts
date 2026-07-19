import { h } from "hastscript";
import type { Link, Paragraph, Root, Text } from "mdast";
import ogs from "open-graph-scraper";
import type { OgObject } from "open-graph-scraper/types";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import {
  loadCache,
  getCachedMetadata,
  setCachedMetadata,
  saveCache,
  getInflight,
  setInflight,
} from "./link-card-cache";

interface Options {
  devMode: boolean;
  userAgent: string;
}

interface Data {
  url: string;
  domainName: string;
  title: string;
  description: string;
  faviconSrc: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
}

const FETCH_TIMEOUT_MS = 15000;

const defaultOptions: Options = {
  devMode: !process.argv.includes("build"),
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
};

const remarkLinkCard: Plugin<[Partial<Options>?], Root> = (options) => {
  const mergedOptions: Options = { ...defaultOptions, ...options };

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

      visit(paragraphNode, "link", (linkNode: Link) => {
        if (!isBareLink(linkNode)) return;
        const url = linkNode.url;

        tasks.push(async () => {
          try {
            const data = await getData(url, mergedOptions);
            if (!data) return;
            parent.children.splice(index, 1, generateNode(data));
          } catch (error) {
            console.warn(
              `[remark-link-card] Failed to create a card for ${url}; keeping the plain link: ${error}`,
            );
          }
        });
      });
    });

    await Promise.allSettled(tasks.map((task) => task()));
    await saveCache();
  };

  return transformer;
};

const isBareLink = (linkNode: Link): boolean => {
  if (
    linkNode.children.length !== 1 ||
    linkNode.children[0].type !== "text" ||
    (linkNode.children[0] as Text).value !== linkNode.url ||
    /\s/.test(linkNode.url)
  )
    return false;

  try {
    const parsed = new URL(linkNode.url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const fetchMetadata = async (
  url: string,
  options: Options,
): Promise<OgObject | null> => {
  await loadCache();
  const cached = getCachedMetadata(url);
  if (cached !== undefined) return cached;

  if (options.devMode) return null;

  const existing = getInflight(url);
  if (existing) return existing;

  const promise = (async (): Promise<OgObject | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const data = await ogs({
        url,
        fetchOptions: {
          headers: { "user-agent": options.userAgent },
          signal: controller.signal,
        },
        timeout: FETCH_TIMEOUT_MS,
      });

      clearTimeout(timeoutId);

      if (data.error) {
        setCachedMetadata(url, null);
        return null;
      }

      setCachedMetadata(url, data.result);
      return data.result;
    } catch (error) {
      console.warn(`[remark-link-card] Failed to fetch metadata for ${url}: ${error}`);
      setCachedMetadata(url, null);
      return null;
    }
  })();

  setInflight(url, promise);
  return promise;
};

const resolveThumbnail = (
  metadata: OgObject,
  pageUrl: URL,
): { url: string; alt: string } => {
  const tryUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    try {
      if (trimmed.startsWith("//")) return new URL(pageUrl.protocol + trimmed).href;
      if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
      return new URL(trimmed).href;
    } catch {
      return "";
    }
  };

  if (metadata.ogImage?.[0]?.url) {
    const url = tryUrl(metadata.ogImage[0].url);
    if (url) return { url, alt: metadata.ogImage[0].alt ?? "" };
  }
  if (metadata.twitterImage?.[0]?.url) {
    const url = tryUrl(metadata.twitterImage[0].url);
    if (url) return { url, alt: metadata.twitterImage[0].alt ?? "" };
  }
  return { url: "", alt: "" };
};

const getData = async (url: string, options: Options): Promise<Data | null> => {
  const metadata = await fetchMetadata(url, options);
  if (!metadata) return null;

  const parsedUrl = new URL(url);
  const thumbnail = resolveThumbnail(metadata, parsedUrl);

  return {
    url,
    domainName: parsedUrl.hostname,
    title: metadata.ogTitle ?? parsedUrl.hostname,
    description: metadata.ogDescription ?? "",
    faviconSrc: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`,
    thumbnailSrc: thumbnail.url,
    thumbnailAlt: thumbnail.alt,
  };
};

const generateNode = (data: Data): Text => {
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
            href: data.url,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          [
            h("span", { class: "link-card-info" }, [
              h("span", { class: "link-card-title" }, data.title),
              h("span", { class: "link-card-desc" }, data.description),
              h("span", { class: "link-card-meta" }, [
                h("img", {
                  class: "link-card-favicon",
                  src: data.faviconSrc,
                  alt: "",
                  width: "16",
                  height: "16",
                  loading: "lazy",
                  decoding: "async",
                }),
                h("span", { class: "link-card-domain" }, data.domainName),
              ]),
            ]),
            ...(data.thumbnailSrc
              ? [
                  h("span", { class: "link-card-thumb" }, [
                    h("img", {
                      class: "link-card-image",
                      src: data.thumbnailSrc,
                      alt: data.thumbnailAlt,
                      width: "192",
                      height: "120",
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
  };
};

export default remarkLinkCard;
