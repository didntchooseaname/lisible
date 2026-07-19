import { h } from "hastscript";
import type { Element, Root } from "hast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath } from "#src/i18n/cards";

const LABELS = {
  fr: { copy: "Copier le lien vers cette section", copied: "Lien copié" },
  en: { copy: "Copy link to this section", copied: "Link copied" },
} as const;

const HEADINGS = new Set(["h2", "h3", "h4"]);

const linkIcon = (): Element =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "14",
      height: "14",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.75",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
      h("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }),
    ],
  );

function textOf(node: Element | { type: string; value?: string; children?: unknown[] }): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => textOf(child as Element)).join("");
  }
  return "";
}

const rehypeHeadingAnchors: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const labels = LABELS[locale];

    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || id.length === 0) return;
      if (
        node.children.some(
          (child) =>
            child.type === "element" &&
            String((child as Element).properties?.className ?? "").includes("heading-anchor"),
        )
      ) {
        return;
      }

      const heading = textOf(node).trim();
      const existing = node.properties.className;
      node.properties.className = Array.isArray(existing)
        ? [...existing, "has-anchor"]
        : ["has-anchor"];

      node.children.push(
        h(
          "a",
          {
            class: "heading-anchor",
            href: `#${id}`,
            "aria-label": heading ? `${labels.copy}: ${heading}` : labels.copy,
            "data-anchor-copied": labels.copied,
          },
          [linkIcon()],
        ),
      );
    });
  };

  return transformer;
};

export default rehypeHeadingAnchors;
