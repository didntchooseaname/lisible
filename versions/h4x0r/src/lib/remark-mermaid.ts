import { h } from "hastscript";
import type { Root, Code, Paragraph } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath } from "#src/i18n/cards";
import { contentStrings } from "#src/i18n/content";
import { diagramShell } from "./diagram-hast";

const remarkMermaid: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const strings = contentStrings[locale].diagram;

    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || parent === undefined || index === undefined) return;

      const source = node.value ?? "";
      const encoded = Buffer.from(source, "utf8").toString("base64");

      const replacement = {
        type: "paragraph",
        children: [],
        data: {
          hName: "div",
          hProperties: { class: "diagram-wrap" },
          hChildren: [
            diagramShell({
              kind: "mermaid",
              label: strings.mermaid,
              strings,
              dataAttributes: { "data-diagram-source": encoded },
              fallback: [h("div", { class: "mermaid-source" }, source)],
            }),
          ],
        },
      } as unknown as Paragraph;

      parent.children[index] = replacement;
    });
  };

  return transformer;
};

export default remarkMermaid;
