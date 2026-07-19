import { h } from "hastscript";
import type { Element, Root } from "hast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, cardStrings } from "#src/i18n/cards";

const HEADINGS = new Set(["h2", "h3", "h4"]);

const rehypeHeadingAnchors: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const label = cardStrings[locale].anchor.label;

    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || !id) return;
      if (node.properties?.dataAnchored) return;
      node.properties = node.properties ?? {};
      node.properties.dataAnchored = true;
      node.properties.class = [
        ...(typeof node.properties.class === "string" ? [node.properties.class] : []),
        "heading-with-anchor",
      ].join(" ");

      const anchor = h(
        "a",
        {
          class: "heading-anchor",
          href: `#${id}`,
          "data-heading-anchor": "",
          "aria-label": label,
          title: label,
        },
        [
          h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              width: "16",
              height: "16",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              "aria-hidden": "true",
            },
            [
              h("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
              h("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }),
            ],
          ),
        ],
      );
      node.children.push(anchor);
    });
  };
  return transformer;
};

export default rehypeHeadingAnchors;
