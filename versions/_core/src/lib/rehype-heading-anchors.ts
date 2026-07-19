import GithubSlugger from "github-slugger";
import { h } from "hastscript";
import type { Element, ElementContent, Root, Text } from "hast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, type CardLocale } from "#src/i18n/cards";

const anchorLabels: Record<CardLocale, string> = {
  fr: "Copier le lien vers cette section",
  en: "Copy link to this section",
};

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function textContent(node: Element): string {
  let out = "";
  visit(node, "text", (text: Text) => {
    out += text.value;
  });
  return out;
}

const linkIcon = (): ElementContent =>
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
  );

const rehypeHeadingAnchors: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const label = anchorLabels[locale];
    const slugger = new GithubSlugger();

    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;

      node.properties = node.properties ?? {};
      if (typeof node.properties.id !== "string") {
        node.properties.id = slugger.slug(textContent(node));
      }
      const id = node.properties.id as string;

      const depth = Number.parseInt(node.tagName.slice(1), 10);
      if (depth < 2 || depth > 4) return;

      node.properties.class = [
        ...(Array.isArray(node.properties.class)
          ? node.properties.class
          : node.properties.class
            ? [String(node.properties.class)]
            : []),
        "heading-anchored",
      ];

      node.children.push(
        h(
          "a",
          {
            class: "heading-anchor",
            href: `#${id}`,
            "aria-label": label,
            "data-heading-anchor": "",
          },
          [linkIcon()],
        ),
      );
    });
  };

  return transformer;
};

export default rehypeHeadingAnchors;
