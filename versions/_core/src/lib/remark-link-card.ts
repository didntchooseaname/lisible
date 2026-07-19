import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Link, Paragraph, Root, Text } from "mdast";
import ogs from "open-graph-scraper";
import type { OgObject } from "open-graph-scraper/types";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import {
  getCachedMetadata,
  getInflight,
  loadCache,
  saveCache,
  setCachedMetadata,
  setInflight,
} from "./link-card-cache";

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
const IS_DEV = import.meta.env?.DEV === true;

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

  if (!isValidUrl(parsed.href)) return null;
  return parsed;
};

const fetchMetadata = async (url: string): Promise<OgObject | null> => {
  await loadCache();
  const cached = getCachedMetadata(url);
  if (cached !== undefined) return cached;

  if (IS_DEV) return null;

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
  const tryUrl = (raw: string | undefined): string => {
    const trimmed = raw?.trim() ?? "";
    if (!trimmed) return "";
    try {
      if (trimmed.startsWith("//")) return new URL(pageUrl.protocol + trimmed).href;
      if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
      return new URL(trimmed).href;
    } catch {
      return "";
    }
  };

  const og = metadata.ogImage?.[0];
  const ogUrl = tryUrl(og?.url);
  if (ogUrl) return { url: ogUrl, alt: og?.alt ?? "" };

  const tw = metadata.twitterImage?.[0];
  const twUrl = tryUrl(tw?.url);
  if (twUrl) return { url: twUrl, alt: tw?.alt ?? "" };

  return { url: "", alt: "" };
};

const getData = async (pageUrl: URL): Promise<CardData | null> => {
  const metadata = await fetchMetadata(pageUrl.href);
  if (!metadata) return null;

  const thumbnail = resolveThumbnail(metadata, pageUrl);

  return {
    url: pageUrl.href,
    domainName: pageUrl.hostname,
    title: metadata.ogTitle ?? metadata.twitterTitle ?? pageUrl.hostname,
    description: metadata.ogDescription ?? metadata.twitterDescription ?? "",
    faviconSrc: `https://www.google.com/s2/favicons?domain=${pageUrl.hostname}&sz=32`,
    thumbnailSrc: thumbnail.url,
    thumbnailAlt: thumbnail.alt,
  };
};

const generateNode = (data: CardData): Text => {
  const info: ElementContent[] = [
    h("span", { class: "link-card-title" }, data.title),
    ...(data.description
      ? [h("span", { class: "link-card-description" }, data.description)]
      : []),
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
  ];

  const thumbnail: ElementContent[] = data.thumbnailSrc
    ? [
        h("span", { class: "link-card-thumbnail" }, [
          h("img", {
            class: "link-card-image",
            src: data.thumbnailSrc,
            alt: data.thumbnailAlt,
            width: String(THUMB_WIDTH),
            height: String(THUMB_HEIGHT),
            loading: "lazy",
            decoding: "async",
          }),
        ]),
      ]
    : [];

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
          [h("span", { class: "link-card-info" }, info), ...thumbnail],
        ),
      ],
    },
  };
};

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
          const data = await getData(pageUrl);
          if (!data) return;
          parent.children.splice(index, 1, generateNode(data));
        } catch (error) {
          console.warn(
            `[remark-link-card] Failed to create link card for ${child.url}, falling back to plain link: ${error}`,
          );
        }
      });
    });

    await Promise.allSettled(tasks.map((task) => task()));
    await saveCache();
  };

  return transformer;
};

export default remarkLinkCard;
