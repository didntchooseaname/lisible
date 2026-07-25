// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkLinkCard } from "../../../../shared/markdown/remark-link-card";

const remarkLinkCard = createRemarkLinkCard({
  classNames: {
    wrap: "link-card-wrap",
    card: "link-card",
    info: "link-card-info",
    title: "link-card-title",
    description: "link-card-desc",
    meta: "link-card-meta",
    favicon: "link-card-favicon",
    domain: "link-card-domain",
    thumbnail: "link-card-thumb",
    image: "link-card-image",
  },
  blockTag: "span",
  thumbWidth: 192,
  thumbHeight: 120,
  faviconSize: 32,
  imgDecoding: true,
  renderEmptyDescription: true,
  titleFallback: "og",
  descriptionFallback: "og",
  trimText: false,
  thumbnailAlt: true,
  thumbnailStrategy: "each",
  normalizeThumbnailUrl: true,
  urlValidation: "protocol",
  linkDetection: "nested",
  useRawUrl: true,
  useAbortController: true,
  isDev: () => !process.argv.includes("build"),
  onFetchError: (url, error) => {
    console.warn(`[remark-link-card] Failed to fetch metadata for ${url}: ${error}`);
  },
  onCardError: (url, error) => {
    console.warn(
      `[remark-link-card] Failed to create a card for ${url}; keeping the plain link: ${error}`,
    );
  },
});

export default remarkLinkCard;
