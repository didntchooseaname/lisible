import { h, s } from "hastscript";
import type { Root, Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { defaultLocale, ui, type Locale } from "#src/i18n/ui";

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

const HEADINGS = new Set(["h2", "h3", "h4"]);

const linkIcon = () =>
  s(
    "svg",
    {
      class: "heading-anchor-icon",
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      s("path", {
        d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      }),
      s("path", {
        d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      }),
    ],
  );

const rehypeHeadingAnchors: Plugin<[], Root> = () => {
  return (tree, file) => {
    const dict = ui[localeFromPath(file?.path)].a11y;
    const label = dict.headingAnchor;
    const copied = dict.headingCopied;

    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;
      const id = node.properties?.id;
      if (typeof id !== "string" || id.length === 0) return;

      node.properties.class = [
        ...(Array.isArray(node.properties.class)
          ? node.properties.class
          : node.properties.class
            ? [String(node.properties.class)]
            : []),
        "heading-with-anchor",
      ];

      node.children.push(
        h(
          "a",
          {
            class: "heading-anchor",
            href: `#${id}`,
            "aria-label": label,
            "data-heading-anchor": "",
            "data-copied": copied,
          },
          [linkIcon()],
        ),
      );
    });
  };
};

export default rehypeHeadingAnchors;
