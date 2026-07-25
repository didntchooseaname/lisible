// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkLinkCard } from "../../../../shared/markdown/remark-link-card";

const remarkLinkCard = createRemarkLinkCard({
  classNames: {
    wrap: "link-card-wrap",
    card: "link-card",
    info: "link-card-info",
    title: "link-card-title",
    description: "link-card-description",
    meta: "link-card-meta",
    favicon: "link-card-favicon",
    domain: "link-card-domain",
    thumbnail: "link-card-thumbnail",
    image: "link-card-image",
  },
  blockTag: "span",
  thumbWidth: 200,
  thumbHeight: 150,
  faviconSize: 32,
  imgDecoding: true,
  renderEmptyDescription: false,
  titleFallback: "og-twitter",
  descriptionFallback: "og-twitter",
  trimText: false,
  thumbnailAlt: true,
  thumbnailStrategy: "each",
  normalizeThumbnailUrl: true,
  urlValidation: "regex",
  linkDetection: "direct",
  useRawUrl: false,
  useAbortController: true,
  isDev: () => import.meta.env?.DEV === true,
  onFetchError: (url, error) => {
    console.warn(`[remark-link-card] Failed to fetch metadata for ${url}: ${error}`);
  },
  onCardError: (url, error) => {
    console.warn(
      `[remark-link-card] Failed to create link card for ${url}, falling back to plain link: ${error}`,
    );
  },
});

export default remarkLinkCard;
