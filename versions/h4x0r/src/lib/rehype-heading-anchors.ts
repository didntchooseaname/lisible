// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Element } from "hast";
import { h } from "hastscript";
import {
  createRehypeHeadingAnchors,
  HEADING_LINK_PATHS,
} from "../../../../shared/markdown/rehype-heading-anchors";
import { cardLocaleFromPath } from "../i18n/cards";

const LABELS = {
  fr: { copy: "Copier le lien vers cette section", copied: "Lien copié" },
  en: { copy: "Copy link to this section", copied: "Link copied" },
} as const;

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
    HEADING_LINK_PATHS.map((d) => h("path", { d })),
  );

function textOf(node: Element | { type: string; value?: string; children?: unknown[] }): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => textOf(child as Element)).join("");
  }
  return "";
}

export default createRehypeHeadingAnchors({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  shouldAnchor: (node) =>
    !node.children.some(
      (child) =>
        child.type === "element" &&
        String((child as Element).properties?.className ?? "").includes("heading-anchor"),
    ),
  decorate: (node) => {
    const existing = node.properties.className;
    node.properties.className = Array.isArray(existing)
      ? [...existing, "has-anchor"]
      : ["has-anchor"];
  },
  anchor: (id, locale, node) => {
    const labels = LABELS[locale];
    const heading = textOf(node).trim();
    return h(
      "a",
      {
        class: "heading-anchor",
        href: `#${id}`,
        "aria-label": heading ? `${labels.copy}: ${heading}` : labels.copy,
        "data-anchor-copied": labels.copied,
      },
      [linkIcon()],
    );
  },
});
