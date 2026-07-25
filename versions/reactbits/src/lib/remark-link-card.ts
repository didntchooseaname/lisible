// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkLinkCard } from "../../../../shared/markdown/remark-link-card";

const remarkLinkCard = createRemarkLinkCard({
  classNames: {
    wrap: "link-card__container",
    card: "link-card",
    info: "link-card__info",
    title: "link-card__title",
    description: "link-card__description",
    meta: "link-card__domain",
    favicon: "link-card__favicon",
    domain: "link-card__domain-name",
    thumbnail: "link-card__thumbnail",
    image: "link-card__image",
  },
  blockTag: "span",
  thumbWidth: 200,
  thumbHeight: 150,
  faviconSize: 64,
  imgDecoding: true,
  renderEmptyDescription: false,
  titleFallback: "og",
  descriptionFallback: "og",
  trimText: false,
  thumbnailAlt: true,
  thumbnailStrategy: "each",
  normalizeThumbnailUrl: false,
  urlValidation: "regex",
  linkDetection: "nested",
  useRawUrl: false,
  useAbortController: true,
  isDev: () => process.env.NODE_ENV === "development",
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
