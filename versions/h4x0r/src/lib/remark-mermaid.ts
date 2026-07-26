// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h } from "hastscript";
import { createRemarkMermaid } from "../../../../shared/markdown/remark-diagram";
import { cardLocaleFromPath } from "../i18n/cards";
import { contentStrings } from "../i18n/content";
import { diagramShell } from "./diagram-hast";

export default createRemarkMermaid({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  render: ({ code, encoded, locale }) => {
    const strings = contentStrings[locale].diagram;

    return {
      kind: "element",
      nodeType: "paragraph",
      hName: "div",
      hProperties: { class: "diagram-wrap" },
      hChildren: [
        diagramShell({
          kind: "mermaid",
          label: strings.mermaid,
          strings,
          dataAttributes: { "data-diagram-source": encoded },
          fallback: [h("div", { class: "mermaid-source" }, code)],
        }),
      ],
    };
  },
});
