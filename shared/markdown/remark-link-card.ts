import type { ElementContent } from "hast";
import { h } from "hastscript";
import type { Link, Paragraph, Root, Text } from "mdast";
import ogs from "open-graph-scraper";
import type { OgObject } from "open-graph-scraper/types";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import * as sharedCache from "../lib/link-card-cache";

/**
 * Shared core of the remark link card plugin. Every variant renders a bare
 * paragraph link as a rich preview card, but each one has its own class
 * naming contract, markup details and fetch behavior. The core receives all
 * of those axes as options and never normalizes them: the rendered HTML of a
 * variant must stay byte for byte identical to its historical fork.
 */

const FETCH_TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

const STRICT_URL_PATTERN = /^https?:\/\/(?:[-.\w]+)(?:\/[^\s]*)?$/;

export interface LinkCardCacheApi {
  loadCache(): Promise<void>;
  getCachedMetadata(url: string): OgObject | null | undefined;
  setCachedMetadata(url: string, metadata: OgObject | null): void;
  getInflight(url: string): Promise<OgObject | null> | undefined;
  setInflight(url: string, promise: Promise<OgObject | null>): void;
  saveCache(): Promise<void>;
}

export interface LinkCardClassNames {
  /** Outer div wrapping the anchor. */
  wrap: string;
  /** The anchor itself. */
  card: string;
  /** Text column wrapper. */
  info: string;
  /** Title line. */
  title: string;
  /** Description line. */
  description: string;
  /** Favicon plus domain wrapper. */
  meta: string;
  /** Favicon img. */
  favicon: string;
  /** Domain name span. */
  domain: string;
  /** Thumbnail wrapper. */
  thumbnail: string;
  /** Thumbnail img. */
  image: string;
}

export interface RemarkLinkCardOptions {
  /** Class naming contract of the variant, targeted by its stylesheet. */
  classNames: LinkCardClassNames;
  /** Tag used for the non image blocks inside the anchor (domain stays a span). */
  blockTag: "span" | "div";
  /** Rendered thumbnail dimensions. */
  thumbWidth: number;
  thumbHeight: number;
  /** Google favicon service size. */
  faviconSize: number;
  /** Whether the img tags carry decoding="async". */
  imgDecoding: boolean;
  /** Render the description element even when the description is empty. */
  renderEmptyDescription: boolean;
  /** Title fallback chain before the hostname. */
  titleFallback: "og-twitter" | "og";
  /** Description fallback chain before the empty string. */
  descriptionFallback: "og-twitter" | "og";
  /** Trim title and description, replacing a blank title with the hostname. */
  trimText: boolean;
  /** Forward the Open Graph alt text to the thumbnail (otherwise alt is empty). */
  thumbnailAlt: boolean;
  /** "each": try og then twitter, resolving each URL. "first": pick the first raw URL only. */
  thumbnailStrategy: "each" | "first";
  /** Round trip absolute thumbnail URLs through new URL() (rejects invalid ones). */
  normalizeThumbnailUrl: boolean;
  /** "regex": strict pattern on the parsed href. "protocol": http(s) protocol check. */
  urlValidation: "regex" | "protocol";
  /** "direct": only a direct paragraph child link. "nested": visit link descendants. */
  linkDetection: "direct" | "nested";
  /** Fetch, cache and render with the raw markdown URL instead of the parsed href. */
  useRawUrl: boolean;
  /** Abort the metadata fetch through an AbortController after the timeout. */
  useAbortController: boolean;
  /** Development detection: when true, uncached URLs are not fetched. */
  isDev: () => boolean;
  /** Metadata cache implementation, defaults to the shared cache module. */
  cache?: LinkCardCacheApi;
  /** Called when the metadata fetch fails (the failure is cached as null). */
  onFetchError?: (url: string, error: unknown) => void;
  /** Called when building or inserting the card fails (the plain link is kept). */
  onCardError?: (url: string, error: unknown) => void;
}

interface CardData {
  url: string;
  domainName: string;
  title: string;
  description: string;
  faviconSrc: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
}

const parseBareLink = (linkNode: Link, validation: "regex" | "protocol"): URL | null => {
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

  if (validation === "regex") {
    if (!STRICT_URL_PATTERN.test(parsed.href)) return null;
  } else if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  return parsed;
};

const fetchMetadata = async (
  url: string,
  options: RemarkLinkCardOptions,
  cache: LinkCardCacheApi,
): Promise<OgObject | null> => {
  await cache.loadCache();
  const cached = cache.getCachedMetadata(url);
  if (cached !== undefined) return cached;

  if (options.isDev()) return null;

  const existing = cache.getInflight(url);
  if (existing) return existing;

  const promise = (async (): Promise<OgObject | null> => {
    try {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      let signal: AbortSignal | undefined;
      if (options.useAbortController) {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        signal = controller.signal;
      }

      const data = await ogs({
        url,
        fetchOptions: signal
          ? { headers: { "user-agent": USER_AGENT }, signal }
          : { headers: { "user-agent": USER_AGENT } },
        timeout: FETCH_TIMEOUT_MS,
      });

      if (timeoutId !== undefined) clearTimeout(timeoutId);

      if (data.error) {
        cache.setCachedMetadata(url, null);
        return null;
      }

      cache.setCachedMetadata(url, data.result);
      return data.result;
    } catch (error) {
      options.onFetchError?.(url, error);
      cache.setCachedMetadata(url, null);
      return null;
    }
  })();

  cache.setInflight(url, promise);
  return promise;
};

const resolveThumbnail = (
  metadata: OgObject,
  pageUrl: URL,
  options: RemarkLinkCardOptions,
): { url: string; alt: string } => {
  const tryUrl = (raw: string | undefined): string => {
    const trimmed = raw?.trim() ?? "";
    if (!trimmed) return "";
    if (options.normalizeThumbnailUrl) {
      try {
        if (trimmed.startsWith("//")) return new URL(pageUrl.protocol + trimmed).href;
        if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
        return new URL(trimmed).href;
      } catch {
        return "";
      }
    }
    if (trimmed.startsWith("//")) return `${pageUrl.protocol}${trimmed}`;
    if (trimmed.startsWith("/")) return new URL(trimmed, pageUrl).href;
    return trimmed;
  };

  if (options.thumbnailStrategy === "first") {
    const raw = metadata.ogImage?.[0]?.url ?? metadata.twitterImage?.[0]?.url ?? "";
    return { url: tryUrl(raw), alt: "" };
  }

  const og = metadata.ogImage?.[0];
  const ogUrl = tryUrl(og?.url);
  if (ogUrl) return { url: ogUrl, alt: og?.alt ?? "" };

  const tw = metadata.twitterImage?.[0];
  const twUrl = tryUrl(tw?.url);
  if (twUrl) return { url: twUrl, alt: tw?.alt ?? "" };

  return { url: "", alt: "" };
};

const getData = async (
  cardUrl: string,
  pageUrl: URL,
  options: RemarkLinkCardOptions,
  cache: LinkCardCacheApi,
): Promise<CardData | null> => {
  const metadata = await fetchMetadata(cardUrl, options, cache);
  if (!metadata) return null;

  const thumbnail = resolveThumbnail(metadata, pageUrl, options);

  const rawTitle =
    options.titleFallback === "og-twitter"
      ? (metadata.ogTitle ?? metadata.twitterTitle)
      : metadata.ogTitle;
  const rawDescription =
    options.descriptionFallback === "og-twitter"
      ? (metadata.ogDescription ?? metadata.twitterDescription)
      : metadata.ogDescription;

  return {
    url: cardUrl,
    domainName: pageUrl.hostname,
    title: options.trimText
      ? (rawTitle ?? "").trim() || pageUrl.hostname
      : (rawTitle ?? pageUrl.hostname),
    description: options.trimText ? (rawDescription ?? "").trim() : (rawDescription ?? ""),
    faviconSrc: `https://www.google.com/s2/favicons?domain=${pageUrl.hostname}&sz=${options.faviconSize}`,
    thumbnailSrc: thumbnail.url,
    thumbnailAlt: thumbnail.alt,
  };
};

const generateNode = (data: CardData, options: RemarkLinkCardOptions): Text => {
  const classNames = options.classNames;
  const tag = options.blockTag;
  const decoding = options.imgDecoding ? { decoding: "async" } : {};

  const info: ElementContent[] = [
    h(tag, { class: classNames.title }, data.title),
    ...(options.renderEmptyDescription || data.description
      ? [h(tag, { class: classNames.description }, data.description)]
      : []),
    h(tag, { class: classNames.meta }, [
      h("img", {
        class: classNames.favicon,
        src: data.faviconSrc,
        alt: "",
        width: "16",
        height: "16",
        loading: "lazy",
        ...decoding,
      }),
      h("span", { class: classNames.domain }, data.domainName),
    ]),
  ];

  const thumbnail: ElementContent[] = data.thumbnailSrc
    ? [
        h(tag, { class: classNames.thumbnail }, [
          h("img", {
            class: classNames.image,
            src: data.thumbnailSrc,
            alt: options.thumbnailAlt ? data.thumbnailAlt : "",
            width: String(options.thumbWidth),
            height: String(options.thumbHeight),
            loading: "lazy",
            ...decoding,
          }),
        ]),
      ]
    : [];

  return {
    type: "text",
    value: "",
    data: {
      hName: "div",
      hProperties: { class: classNames.wrap },
      hChildren: [
        h(
          "a",
          {
            class: classNames.card,
            href: data.url,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          [h(tag, { class: classNames.info }, info), ...thumbnail],
        ),
      ],
    },
  };
};

export const createRemarkLinkCard = (options: RemarkLinkCardOptions): Plugin<[], Root> => {
  const cache = options.cache ?? sharedCache;

  return () => {
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

        const handleLink = (linkNode: Link): void => {
          const pageUrl = parseBareLink(linkNode, options.urlValidation);
          if (!pageUrl) return;

          const cardUrl = options.useRawUrl ? linkNode.url : pageUrl.href;

          tasks.push(async () => {
            try {
              const data = await getData(cardUrl, pageUrl, options, cache);
              if (!data) return;
              parent.children.splice(index, 1, generateNode(data, options));
            } catch (error) {
              options.onCardError?.(linkNode.url, error);
            }
          });
        };

        if (options.linkDetection === "nested") {
          visit(paragraphNode, "link", (linkNode: Link) => {
            handleLink(linkNode);
          });
        } else {
          const child = paragraphNode.children[0];
          if (child.type === "link") handleLink(child);
        }
      });

      await Promise.allSettled(tasks.map((task) => task()));
      await cache.saveCache();
    };

    return transformer;
  };
};
