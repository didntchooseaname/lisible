// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h } from "hastscript";
import {
  classicLinkIcon,
  createRehypeHeadingAnchors,
} from "../../../../shared/markdown/rehype-heading-anchors";
import { cardLocaleFromPath, cardStrings } from "../i18n/cards";

export default createRehypeHeadingAnchors({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  shouldAnchor: (node) => !node.properties?.dataAnchored,
  decorate: (node) => {
    node.properties = node.properties ?? {};
    node.properties.dataAnchored = true;
    node.properties.class = [
      ...(typeof node.properties.class === "string" ? [node.properties.class] : []),
      "heading-with-anchor",
    ].join(" ");
  },
  anchor: (id, locale) => {
    const label = cardStrings[locale].anchor.label;
    return h(
      "a",
      {
        class: "heading-anchor",
        href: `#${id}`,
        "data-heading-anchor": "",
        "aria-label": label,
        title: label,
      },
      [classicLinkIcon()],
    );
  },
});
