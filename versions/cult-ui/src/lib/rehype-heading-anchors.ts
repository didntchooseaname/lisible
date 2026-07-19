import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const LABELS = {
  fr: "Copier le lien vers cette section",
  en: "Copy link to this section",
} as const;

const LINK_ICON = {
  type: "element" as const,
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
  children: [
    {
      type: "element" as const,
      tagName: "path",
      properties: { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" },
      children: [],
    },
    {
      type: "element" as const,
      tagName: "path",
      properties: { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
      children: [],
    },
  ],
};

const HEADINGS = new Set(["h2", "h3", "h4"]);

const rehypeHeadingAnchors: Plugin<[], Root> = () => {
  return (tree, file) => {
    const locale = file.path?.includes("/blog/en/") ? "en" : "fr";
    const label = LABELS[locale];

    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || id.length === 0) return;

      node.properties = { ...node.properties, className: ["heading-linked"] };
      node.children.push({
        type: "element",
        tagName: "a",
        properties: {
          className: ["heading-anchor"],
          href: `#${id}`,
          ariaLabel: label,
          dataHeadingAnchor: "",
        },
        children: [LINK_ICON],
      });
    });
  };
};

export default rehypeHeadingAnchors;
