import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, cardStrings, type CardLocale } from "#src/i18n/cards";

const VARIANTS = ["note", "tip", "warning", "caution", "important"] as const;
type Variant = (typeof VARIANTS)[number];

const ICONS: Record<Variant, ElementContent[]> = {
  note: [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 16v-4" }),
    h("path", { d: "M12 8h.01" }),
  ],
  tip: [
    h("path", {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    }),
    h("path", { d: "M9 18h6" }),
    h("path", { d: "M10 22h4" }),
  ],
  warning: [
    h("path", {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    }),
    h("path", { d: "M12 9v4" }),
    h("path", { d: "M12 17h.01" }),
  ],
  caution: [
    h("path", {
      d: "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
    }),
    h("path", { d: "M12 8v4" }),
    h("path", { d: "M12 16h.01" }),
  ],
  important: [
    h("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    }),
    h("path", { d: "M12 7v2" }),
    h("path", { d: "M12 13h.01" }),
  ],
};

const icon = (variant: Variant): ElementContent =>
  h(
    "svg",
    {
      class: "callout-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    ICONS[variant],
  );

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      class: "callout-chevron",
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
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );

interface MdNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: MdNode[];
  value?: string;
  data?: {
    directiveLabel?: boolean;
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
  };
}

function textOf(node: MdNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function makeCallout(node: MdNode, variant: Variant, locale: CardLocale): void {
  const children = node.children ?? [];
  const collapse =
    node.attributes && Object.prototype.hasOwnProperty.call(node.attributes, "collapse");

  let title = cardStrings[locale].callout[variant];
  const first = children[0];
  if (first && first.data?.directiveLabel) {
    const label = textOf(first).trim();
    if (label) title = label;
    children.shift();
  }

  const headExtras: ElementContent[] = collapse ? [chevron()] : [];
  const header: MdNode = {
    type: "paragraph",
    children: [],
    data: {
      hName: collapse ? "summary" : "div",
      hProperties: { class: "callout-header" },
      hChildren: [icon(variant), h("span", { class: "callout-title" }, title), ...headExtras],
    },
  };

  const body: MdNode = {
    type: "calloutBody",
    children,
    data: { hName: "div", hProperties: { class: "callout-body" } },
  };

  node.children = [header, body];
  node.data = node.data ?? {};
  node.data.hName = collapse ? "details" : "aside";
  node.data.hProperties = {
    class: `callout callout-${variant}${collapse ? " callout-collapsible" : ""}`,
  };
}

const remarkCallouts: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    visit(tree, (node) => {
      const directive = node as unknown as MdNode;
      if (directive.type !== "containerDirective") return;
      const name = directive.name as Variant | undefined;
      if (!name || !VARIANTS.includes(name)) return;
      makeCallout(directive, name, locale);
    });
  };
  return transformer;
};

export default remarkCallouts;
