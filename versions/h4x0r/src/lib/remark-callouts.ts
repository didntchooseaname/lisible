import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root, Paragraph } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath } from "#src/i18n/cards";
import { contentStrings } from "#src/i18n/content";

type CalloutKind = "note" | "tip" | "warning" | "caution" | "important";

const KINDS: readonly CalloutKind[] = ["note", "tip", "warning", "caution", "important"];

const ICON_PATHS: Record<CalloutKind, string[]> = {
  note: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01",
  ],
  tip: [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4",
  ],
  warning: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  caution: [
    "M12 16h.01",
    "M12 8v4",
    "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
  ],
  important: [
    "M22 17a2 2 0 0 1-2 2H6.5a1 1 0 0 0-.8.4l-1.9 2.533A1 1 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
    "M12 15h.01",
    "M12 7v4",
  ],
};

const icon = (kind: CalloutKind): ElementContent =>
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
      class: "callout-icon",
    },
    ICON_PATHS[kind].map((d) => h("path", { d })),
  );

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "14",
      height: "14",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      class: "callout-chevron",
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children: Array<Paragraph & { data?: { directiveLabel?: boolean } }>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

function nodeText(node: unknown): string {
  const n = node as { value?: string; children?: unknown[] };
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) return n.children.map(nodeText).join("");
  return "";
}

const remarkCallouts: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const strings = contentStrings[locale].callouts;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      const kind = directive.name as CalloutKind;
      if (!KINDS.includes(kind)) return;

      const collapsible = directive.attributes?.collapse !== undefined;

      let title = strings[kind];
      const first = directive.children[0];
      if (first?.data?.directiveLabel) {
        const label = nodeText(first).trim();
        if (label) title = label;
        directive.children.shift();
      }

      const titleChildren: ElementContent[] = [
        icon(kind),
        h("span", { class: "callout-title-text" }, title),
      ];
      if (collapsible) titleChildren.push(chevron());

      const titleNode = {
        type: "paragraph",
        children: [],
        data: {
          hName: collapsible ? "summary" : "p",
          hProperties: { class: "callout-title" },
          hChildren: titleChildren,
        },
      } as unknown as Paragraph;

      directive.children.unshift(titleNode);

      const data = directive.data ?? (directive.data = {});
      data.hName = collapsible ? "details" : "div";
      data.hProperties = {
        class: `callout callout-${kind}${collapsible ? " callout-collapsible" : ""}`,
      };
    });
  };

  return transformer;
};

export default remarkCallouts;
