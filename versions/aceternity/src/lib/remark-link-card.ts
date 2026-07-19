import { h } from "hastscript";
import type { Paragraph, Root, Text } from "mdast";
import ogs from "open-graph-scraper";
import type { OgObject } from "open-graph-scraper/types";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import {
  loadCache,
  getCachedMetadata,
  setCachedMetadata,
  saveCache,
  getInflight,
  setInflight,
} from "./link-card-cache";

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

interface CardData {
  url: string;
  domainName: string;
  title: string;
  description: string;
  faviconSrc: string;
  thumbnailSrc: string;
}

const getBareLinkUrl = (paragraphNode: Paragraph): URL | null => {
  if (paragraphNode.children.length !== 1) return null;
  const linkNode = paragraphNode.children[0];
  if (linkNode.type !== "link") return null;
  if (
    linkNode.children.length !== 1 ||
    linkNode.children[0].type !== "text" ||
    (linkNode.children[0] as Text).value !== linkNode.url ||
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
};

const fetchMetadata = async (url: string): Promise<OgObject | null> => {
  await loadCache();
  const cached = getCachedMetadata(url);
  if (cached !== undefined) return cached;

  if (process.env.NODE_ENV === "development") return null;

  const existing = getInflight(url);
  if (existing) return existing;

  const promise = (async (): Promise<OgObject | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const data = await ogs({
        url,
        fetchOptions: {
          headers: { "user-agent": USER_AGENT },
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
    } catch {
      console.warn(
        `[remark-link-card] Failed to fetch metadata for ${url}; keeping the plain link.`,
      );
      setCachedMetadata(url, null);
      return null;
    }
  })();

  setInflight(url, promise);
  return promise;
};

const resolveThumbnailUrl = (metadata: OgObject, pageUrl: URL): string => {
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
    if (url) return url;
  }
  if (metadata.twitterImage?.[0]?.url) {
    const url = tryUrl(metadata.twitterImage[0].url);
    if (url) return url;
  }
  return "";
};

const getData = async (pageUrl: URL): Promise<CardData | null> => {
  const metadata = await fetchMetadata(pageUrl.href);
  if (!metadata) return null;

  return {
    url: pageUrl.href,
    domainName: pageUrl.hostname,
    title: metadata.ogTitle ?? pageUrl.hostname,
    description: metadata.ogDescription ?? "",
    faviconSrc: `https://www.google.com/s2/favicons?domain=${pageUrl.hostname}&sz=32`,
    thumbnailSrc: resolveThumbnailUrl(metadata, pageUrl),
  };
};

const generateNode = (data: CardData): Text => {
  return {
    type: "text",
    value: "",
    data: {
      hName: "div",
      hProperties: { class: "link-card__container" },
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
            h("div", { class: "link-card__info" }, [
              h("div", { class: "link-card__title" }, [data.title]),
              ...(data.description
                ? [h("div", { class: "link-card__description" }, [data.description])]
                : []),
              h("div", { class: "link-card__metadata" }, [
                h("img", {
                  class: "link-card__favicon",
                  src: data.faviconSrc,
                  alt: "",
                  width: "16",
                  height: "16",
                  loading: "lazy",
                }),
                h("span", { class: "link-card__domain-name" }, [data.domainName]),
              ]),
            ]),
            ...(data.thumbnailSrc
              ? [
                  h("div", { class: "link-card__thumbnail" }, [
                    h("img", {
                      class: "link-card__image",
                      src: data.thumbnailSrc,
                      alt: "",
                      width: "200",
                      height: "150",
                      loading: "lazy",
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

export function remarkLinkCard() {
  const transformer: Transformer<Root> = async (tree) => {
    const tasks: Array<() => Promise<void>> = [];

    visit(tree, "paragraph", (paragraphNode: Paragraph, index, parent) => {
      if (
        index === undefined ||
        parent === undefined ||
        parent.type !== "root" ||
        paragraphNode.data !== undefined
      )
        return;

      const pageUrl = getBareLinkUrl(paragraphNode);
      if (!pageUrl) return;

      tasks.push(async () => {
        try {
          const data = await getData(pageUrl);
          if (!data) return;
          parent.children.splice(index, 1, generateNode(data));
        } catch {
        }
      });
    });

    await Promise.allSettled(tasks.map((task) => task()));
    await saveCache();
  };

  return transformer;
}
