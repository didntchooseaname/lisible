// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkLinkCard } from "../../../../shared/markdown/remark-link-card";

export const remarkLinkCard = createRemarkLinkCard({
  classNames: {
    wrap: "link-card__container",
    card: "link-card",
    info: "link-card__info",
    title: "link-card__title",
    description: "link-card__description",
    meta: "link-card__metadata",
    favicon: "link-card__favicon",
    domain: "link-card__domain-name",
    thumbnail: "link-card__thumbnail",
    image: "link-card__image",
  },
  blockTag: "div",
  thumbWidth: 200,
  thumbHeight: 150,
  faviconSize: 32,
  imgDecoding: false,
  renderEmptyDescription: false,
  titleFallback: "og",
  descriptionFallback: "og",
  trimText: false,
  thumbnailAlt: false,
  thumbnailStrategy: "each",
  normalizeThumbnailUrl: true,
  urlValidation: "protocol",
  linkDetection: "direct",
  useRawUrl: false,
  useAbortController: true,
  isDev: () => process.env.NODE_ENV === "development",
  onFetchError: (url) => {
    console.warn(`[remark-link-card] Failed to fetch metadata for ${url}; keeping the plain link.`);
  },
});
