// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h, s } from "hastscript";
import {
  createRehypeHeadingAnchors,
  HEADING_LINK_PATHS,
} from "../../../../shared/markdown/rehype-heading-anchors";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

const linkIcon = () =>
  s(
    "svg",
    {
      class: "heading-anchor-icon",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
    },
    HEADING_LINK_PATHS.map((d) => s("path", { d })),
  );

export default createRehypeHeadingAnchors({
  locale: (file) => localeFromPath(file?.path),
  decorate: (node) => {
    node.properties.class = [
      ...(Array.isArray(node.properties.class)
        ? node.properties.class
        : node.properties.class
          ? [String(node.properties.class)]
          : []),
      "heading-with-anchor",
    ];
  },
  anchor: (id, locale) => {
    const dict = ui[locale].a11y;
    return h(
      "a",
      {
        class: "heading-anchor",
        href: `#${id}`,
        "aria-label": dict.headingAnchor,
        "data-heading-anchor": "",
        "data-copied": dict.headingCopied,
      },
      [linkIcon()],
    );
  },
});
