import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import {
  calloutTitles,
  cardLocaleFromPath,
  isCalloutVariant,
  type CalloutVariant,
} from "#src/i18n/callouts";

const icon = (paths: ElementContent[]): ElementContent =>
  h(
    "svg",
    {
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
    paths,
  );

const icons: Record<CalloutVariant, ElementContent> = {
  note: icon([
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 16v-4" }),
    h("path", { d: "M12 8h.01" }),
  ]),
  tip: icon([
    h("path", {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    }),
    h("path", { d: "M9 18h6" }),
    h("path", { d: "M10 22h4" }),
  ]),
  warning: icon([
    h("path", {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    }),
    h("path", { d: "M12 9v4" }),
    h("path", { d: "M12 17h.01" }),
  ]),
  caution: icon([
    h("path", {
      d: "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
    }),
    h("path", { d: "M12 8v4" }),
    h("path", { d: "M12 16h.01" }),
  ]),
  important: icon([
    h("path", {
      d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    }),
    h("path", { d: "M12 7v4" }),
    h("path", { d: "M12 15h.01" }),
  ]),
};

const chevron = (): ElementContent =>
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
      class: "callout-chevron",
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    directiveLabel?: boolean;
  };
}

const remarkCallouts: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      const name = directive.name ?? "";
      if (!isCalloutVariant(name)) return;

      const variant = name;
      const collapsible = directive.attributes?.collapse !== undefined;
      const children = (directive.children ?? []) as DirectiveNode[];

      let titleChildren: unknown[] = [{ type: "text", value: calloutTitles[locale][variant] }];
      let body = children;
      const first = children[0];
      if (first?.data?.directiveLabel) {
        titleChildren = (first.children ?? []) as unknown[];
        body = children.slice(1);
      }

      const headerChildren: DirectiveNode[] = [
        { type: "calloutIcon", data: { hName: "span", hProperties: { class: "callout-icon" } }, children: [] } as unknown as DirectiveNode,
        { type: "calloutTitle", data: { hName: "span", hProperties: { class: "callout-title" } }, children: titleChildren } as unknown as DirectiveNode,
      ];
      (headerChildren[0].data as { hChildren?: ElementContent[] }).hChildren = [icons[variant]];
      if (collapsible) {
        headerChildren.push({
          type: "calloutChevron",
          data: { hName: "span", hProperties: { class: "callout-chevron-wrap" }, hChildren: [chevron()] },
          children: [],
        } as unknown as DirectiveNode);
      }

      const header: DirectiveNode = {
        type: "calloutHeader",
        data: {
          hName: collapsible ? "summary" : "div",
          hProperties: { class: "callout-header" },
        },
        children: headerChildren,
      };

      const bodyNode: DirectiveNode = {
        type: "calloutBody",
        data: { hName: "div", hProperties: { class: "callout-body" } },
        children: body,
      };

      directive.data = directive.data ?? {};
      directive.data.hName = collapsible ? "details" : "div";
      directive.data.hProperties = {
        class: `callout callout-${variant}${collapsible ? " callout-collapsible" : ""}`,
        "data-callout": variant,
      };
      directive.children = [header, bodyNode];
    });
  };

  return transformer;
};

export default remarkCallouts;
