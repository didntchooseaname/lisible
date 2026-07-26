// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Element } from "hast";
import {
  createRehypeHeadingAnchors,
  HEADING_LINK_PATHS,
} from "../../../../shared/markdown/rehype-heading-anchors";

const LABELS = {
  fr: "Copier le lien vers cette section",
  en: "Copy link to this section",
} as const;

const LINK_ICON: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    className: ["heading-anchor-icon"],
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ariaHidden: "true",
  },
  children: HEADING_LINK_PATHS.map((d) => ({
    type: "element" as const,
    tagName: "path",
    properties: { d },
    children: [],
  })),
};

export default createRehypeHeadingAnchors({
  locale: (file): "fr" | "en" => (file?.path?.includes("/blog/en/") ? "en" : "fr"),
  decorate: (node) => {
    node.properties = { ...node.properties, className: ["heading-linked"] };
  },
  anchor: (id, locale) => ({
    type: "element",
    tagName: "a",
    properties: {
      className: ["heading-anchor"],
      href: `#${id}`,
      ariaLabel: LABELS[locale],
      dataHeadingAnchor: "",
    },
    children: [LINK_ICON],
  }),
});
