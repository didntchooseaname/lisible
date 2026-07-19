import { s } from "hastscript";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { ui, defaultLocale, type Locale } from "#src/i18n/ui";

type CalloutType = "note" | "tip" | "warning" | "caution" | "important";

const TYPES: readonly CalloutType[] = [
  "note",
  "tip",
  "warning",
  "caution",
  "important",
];

const ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  class: "callout__icon",
} as const;

const icons: Record<CalloutType, () => unknown> = {
  note: () =>
    s("svg", { ...ICON_ATTRS }, [
      s("circle", { cx: 12, cy: 12, r: 10 }),
      s("path", { d: "M12 16v-4" }),
      s("path", { d: "M12 8h.01" }),
    ]),
  tip: () =>
    s("svg", { ...ICON_ATTRS }, [
      s("path", {
        d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      }),
      s("path", { d: "M9 18h6" }),
      s("path", { d: "M10 22h4" }),
    ]),
  warning: () =>
    s("svg", { ...ICON_ATTRS }, [
      s("path", {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
      }),
      s("path", { d: "M12 9v4" }),
      s("path", { d: "M12 17h.01" }),
    ]),
  caution: () =>
    s("svg", { ...ICON_ATTRS }, [
      s("path", { d: "M12 16h.01" }),
      s("path", { d: "M12 8v4" }),
      s("path", {
        d: "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
      }),
    ]),
  important: () =>
    s("svg", { ...ICON_ATTRS }, [
      s("path", { d: "M12 7v2" }),
      s("path", { d: "M12 13h.01" }),
      s("path", {
        d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
      }),
    ]),
};

const chevron = () =>
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
      class: "callout__chevron",
    },
    [s("path", { d: "m6 9 6 6 6-6" })],
  );

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  children: Array<{
    type: string;
    data?: { directiveLabel?: boolean };
    children?: Array<{ type: string; value?: string }>;
  }>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const remarkCallouts: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const filePath = file?.path ?? "";
    const locale: Locale = /[\\/]en[\\/]/.test(filePath) ? "en" : defaultLocale;
    const labels = ui[locale].callouts;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      const type = directive.name as CalloutType;
      if (!TYPES.includes(type)) return;

      let title = labels[type];
      const first = directive.children[0];
      if (first?.data?.directiveLabel) {
        const text = (first.children ?? [])
          .map((child) => child.value ?? "")
          .join("")
          .trim();
        if (text) title = text;
        directive.children.shift();
      }

      const collapsible =
        directive.attributes != null && "collapse" in directive.attributes;

      const headerChildren = [
        icons[type](),
        s("span", { class: "callout__title" }, [title]),
      ];
      if (collapsible) headerChildren.push(chevron());

      const header = {
        type: "paragraph",
        data: {
          hName: collapsible ? "summary" : "div",
          hProperties: { class: "callout__header" },
          hChildren: headerChildren,
        },
        children: [],
      };

      directive.children.unshift(header as never);

      directive.data ??= {};
      directive.data.hName = collapsible ? "details" : "aside";
      directive.data.hProperties = {
        class: `callout callout--${type}`,
        "data-callout": type,
        ...(collapsible ? {} : { role: "note" }),
      };
    });
  };

  return transformer;
};

export default remarkCallouts;
