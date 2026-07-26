// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h, s } from "hastscript";
import {
  createRehypeHeadingAnchors,
  HEADING_LINK_PATHS,
} from "../../../../shared/markdown/rehype-heading-anchors";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const anchorIcon = () =>
  s(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      ...STROKE_ICON_ATTRS,
    },
    HEADING_LINK_PATHS.map((d) => s("path", { d })),
  );

export const rehypeHeadingAnchors = createRehypeHeadingAnchors({
  locale: (file): Locale => (/[\\/]en[\\/]/.test(file?.path ?? "") ? "en" : defaultLocale),
  allowEmptyId: true,
  position: "prepend",
  anchor: (id, locale) => {
    const dict = ui[locale].a11y;
    return h(
      "a",
      {
        class: "heading-anchor",
        href: `#${id}`,
        "aria-label": dict.copyHeadingLink,
        "data-copied-label": dict.headingLinkCopied,
      },
      [anchorIcon()],
    );
  },
});
