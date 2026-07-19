import type { Root, Paragraph } from "mdast";
import type { RootContent } from "mdast";
import type { ElementContent } from "hast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { toHast } from "mdast-util-to-hast";
import { cardLocaleFromPath } from "#src/i18n/cards";
import { contentStrings } from "#src/i18n/content";
import { diagramShell } from "./diagram-hast";

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children: RootContent[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
  };
}

const remarkDrawio: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const strings = contentStrings[locale].diagram;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective" || directive.name !== "drawio") return;

      const src = directive.attributes?.src ?? "";
      const title = directive.attributes?.title?.trim();
      const data = directive.data ?? (directive.data = {});

      if (!src) {
        data.hName = "div";
        data.hProperties = { class: "diagram-wrap" };
        return;
      }

      const fallback = directive.children.flatMap((child) => {
        const hast = toHast({ type: "root", children: [child] } as Root);
        return (hast?.type === "root" ? hast.children : []) as ElementContent[];
      });

      data.hName = "div";
      data.hProperties = { class: "diagram-wrap" };
      data.hChildren = [
        diagramShell({
          kind: "drawio",
          label: title || strings.drawio,
          strings,
          dataAttributes: { "data-diagram-src": src },
          fallback,
        }),
      ];
    });
  };

  return transformer;
};

export default remarkDrawio;
