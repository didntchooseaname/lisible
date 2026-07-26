// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h } from "hastscript";
import {
  classicLinkIcon,
  createRehypeHeadingAnchors,
} from "../../../../shared/markdown/rehype-heading-anchors";
import { type CardLocale, cardLocaleFromPath } from "../i18n/cards";

const anchorLabels: Record<CardLocale, string> = {
  fr: "Copier le lien vers cette section",
  en: "Copy link to this section",
};

export default createRehypeHeadingAnchors({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  slugMissingIds: true,
  allowEmptyId: true,
  decorate: (node) => {
    node.properties.class = [
      ...(Array.isArray(node.properties.class)
        ? node.properties.class
        : node.properties.class
          ? [String(node.properties.class)]
          : []),
      "heading-anchored",
    ];
  },
  anchor: (id, locale) =>
    h(
      "a",
      {
        class: "heading-anchor",
        href: `#${id}`,
        "aria-label": anchorLabels[locale],
        "data-heading-anchor": "",
      },
      [classicLinkIcon()],
    ),
});
