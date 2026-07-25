// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkLinkCard } from "../../../../shared/markdown/remark-link-card";
import * as linkCardCache from "./link-card-cache";

const isDev = process.env.NODE_ENV === "development";

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
    thumbnail: "link-card-thumb",
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
  trimText: true,
  thumbnailAlt: false,
  thumbnailStrategy: "first",
  normalizeThumbnailUrl: true,
  urlValidation: "protocol",
  linkDetection: "direct",
  useRawUrl: false,
  useAbortController: false,
  isDev: () => isDev,
  cache: linkCardCache,
});

export default remarkLinkCard;
