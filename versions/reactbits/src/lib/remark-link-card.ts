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

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

const THUMB_WIDTH = 200;
const THUMB_HEIGHT = 150;

interface CardData {
  url: string;
  domainName: string;
  title: string;
  description: string;
  faviconSrc: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
}

const isValidUrl = (url: string): boolean =>
  /^https?:\/\/(?:[-.\w]+)(?:\/[^\s]*)?$/.test(url);

const getBareLinkUrl = (linkNode: Link): URL | null => {
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

  if (!isValidUrl(parsed.href)) return null;
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
    if (trimmed.startsWith("//")) return `${pageUrl.protocol}${trimmed}`;
    if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
    return trimmed;
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

const getData = async (pageUrl: URL): Promise<CardData | null> => {
  const metadata = await fetchMetadata(pageUrl.href);
  if (!metadata) return null;

  const thumbnail = resolveThumbnail(metadata, pageUrl);

  return {
    url: pageUrl.href,
    domainName: pageUrl.hostname,
    title: metadata.ogTitle ?? pageUrl.hostname,
    description: metadata.ogDescription ?? "",
    faviconSrc: `https://www.google.com/s2/favicons?domain=${pageUrl.hostname}&sz=64`,
    thumbnailSrc: thumbnail.url,
    thumbnailAlt: thumbnail.alt,
  };
};

const generateNode = (data: CardData): Text => ({
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
          h("span", { class: "link-card__info" }, [
            h("span", { class: "link-card__title" }, [data.title]),
            ...(data.description
              ? [h("span", { class: "link-card__description" }, [data.description])]
              : []),
            h("span", { class: "link-card__domain" }, [
              h("img", {
                class: "link-card__favicon",
                src: data.faviconSrc,
                alt: "",
                width: 16,
                height: 16,
                loading: "lazy",
                decoding: "async",
              }),
              h("span", { class: "link-card__domain-name" }, [data.domainName]),
            ]),
          ]),
          ...(data.thumbnailSrc
            ? [
                h("span", { class: "link-card__thumbnail" }, [
                  h("img", {
                    class: "link-card__image",
                    src: data.thumbnailSrc,
                    alt: data.thumbnailAlt,
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
});

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

      visit(paragraphNode, "link", (linkNode: Link) => {
        const pageUrl = getBareLinkUrl(linkNode);
        if (!pageUrl) return;

        tasks.push(async () => {
          try {
            const data = await getData(pageUrl);
            if (!data) return;
            parent.children.splice(index, 1, generateNode(data));
          } catch (error) {
            console.warn(
              `[remark-link-card] Failed to create a card for ${linkNode.url}; keeping the plain link: ${error}`,
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

export default remarkLinkCard;
