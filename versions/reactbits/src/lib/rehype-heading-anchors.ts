import { h, s } from "hastscript";
import { ui, defaultLocale, type Locale } from "#src/i18n/ui";

interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const HEADINGS = new Set(["h2", "h3", "h4"]);

const anchorIcon = () =>
  s(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: 16,
      height: 16,
      viewBox: "0 0 24 24",
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

export function rehypeHeadingAnchors() {
  return (tree: HastNode, file: { path?: string }) => {
    const locale: Locale = /[\\/]en[\\/]/.test(file?.path ?? "")
      ? "en"
      : defaultLocale;
    const dict = ui[locale].a11y;

    const walk = (node: HastNode) => {
      if (
        node.type === "element" &&
        node.tagName &&
        HEADINGS.has(node.tagName) &&
        typeof node.properties?.id === "string"
      ) {
        const id = node.properties.id as string;
        const anchor = h(
          "a",
          {
            class: "heading-anchor",
            href: `#${id}`,
            "aria-label": dict.copyHeadingLink,
            "data-copied-label": dict.headingLinkCopied,
          },
          [anchorIcon()],
        );
        node.children = [anchor as unknown as HastNode, ...(node.children ?? [])];
      }
      for (const child of node.children ?? []) walk(child);
    };

    walk(tree);
  };
}
