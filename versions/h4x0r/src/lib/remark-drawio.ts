// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import type { Root } from "mdast";
import { toHast } from "mdast-util-to-hast";
import { createRemarkDrawio } from "../../../../shared/markdown/remark-diagram";
import { cardLocaleFromPath } from "../i18n/cards";
import { contentStrings } from "../i18n/content";
import { diagramShell } from "./diagram-hast";

export default createRemarkDrawio({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  render: ({ src, title, locale, body }) => {
    const strings = contentStrings[locale].diagram;
    const source = src ?? "";
    const label = title?.trim();

    if (!source) {
      return { hName: "div", hProperties: { class: "diagram-wrap" } };
    }

    const fallback = body.flatMap((child) => {
      const hast = toHast({ type: "root", children: [child] } as Root);
      return (hast?.type === "root" ? hast.children : []) as ElementContent[];
    });

    return {
      hName: "div",
      hProperties: { class: "diagram-wrap" },
      hChildren: [
        diagramShell({
          kind: "drawio",
          label: label || strings.drawio,
          strings,
          dataAttributes: { "data-diagram-src": source },
          fallback,
        }),
      ],
    };
  },
});
