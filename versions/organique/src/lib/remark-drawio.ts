import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, cardStrings, type CardLocale } from "#src/i18n/cards";

const controlIcon = (children: ElementContent[]): ElementContent =>
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
    },
    children,
  );

let counter = 0;

interface MdNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
  };
}

function buildToolbarAndViewport(locale: CardLocale, id: string): ElementContent[] {
  const labels = cardStrings[locale].diagram;
  const btn = (hook: string, label: string, paths: ElementContent[]) =>
    h(
      "button",
      { type: "button", class: "diagram-btn", [hook]: "", "aria-label": label, title: label },
      [controlIcon(paths)],
    );

  const toolbar = h("div", { class: "diagram-toolbar" }, [
    h("span", { class: "diagram-label" }, [
      controlIcon([h("rect", { x: "3", y: "3", width: "7", height: "7" }), h("rect", { x: "14", y: "3", width: "7", height: "7" }), h("rect", { x: "3", y: "14", width: "7", height: "7" }), h("rect", { x: "14", y: "14", width: "7", height: "7" })]),
      h("span", {}, labels.label),
    ]),
    h("div", { class: "diagram-controls" }, [
      btn("data-drawio-zoom-out", labels.zoomOut, [h("circle", { cx: "11", cy: "11", r: "8" }), h("path", { d: "m21 21-4.3-4.3" }), h("path", { d: "M8 11h6" })]),
      h("span", { class: "diagram-zoom-level", "data-drawio-zoom-level": "" }, "100%"),
      btn("data-drawio-zoom-in", labels.zoomIn, [h("circle", { cx: "11", cy: "11", r: "8" }), h("path", { d: "m21 21-4.3-4.3" }), h("path", { d: "M11 8v6" }), h("path", { d: "M8 11h6" })]),
      btn("data-drawio-reset", labels.reset, [h("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }), h("path", { d: "M3 3v5h5" })]),
    ]),
  ]);

  const viewport = h("div", { class: "diagram-viewport", "data-drawio-viewport": "", style: "cursor:grab" }, [
    h("div", { class: "diagram-pan", "data-drawio-pan": "" }, [
      h("div", { class: "diagram-render", "data-drawio-render": "" }),
    ]),
    h("div", { class: "diagram-loading", "data-drawio-loading": "" }, [
      h(
        "svg",
        { class: "diagram-spinner", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", "stroke-width": "2", "aria-hidden": "true" },
        [h("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })],
      ),
      h("span", {}, labels.rendering),
    ]),
    h("div", { class: "diagram-hint", "data-drawio-hint": "" }, labels.hint),
  ]);

  return [toolbar, viewport];
}

const remarkDrawio: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    visit(tree, (node) => {
      const directive = node as unknown as MdNode;
      if (directive.type !== "containerDirective" || directive.name !== "drawio") return;

      const src = directive.attributes?.src;
      if (!src) {
        directive.data = { hName: "div", hProperties: { style: "display:none" }, hChildren: [] };
        directive.children = [];
        return;
      }
      const title = directive.attributes?.title ?? cardStrings[locale].diagram.label;
      const id = `drawio-${(counter++).toString(36)}`;

      const fallbackChildren = directive.children ?? [];
      const viewer: MdNode = {
        type: "paragraph",
        children: [],
        data: {
          hName: "div",
          hProperties: {
            class: "diagram-wrap",
            "data-drawio": "",
            "data-src": src,
            "data-title": title,
            id,
          },
          hChildren: buildToolbarAndViewport(locale, id),
        },
      };
      const fallback: MdNode = {
        type: "drawioFallback",
        children: fallbackChildren,
        data: { hName: "div", hProperties: { class: "diagram-fallback", "data-drawio-fallback": "" } },
      };

      directive.children = [viewer, fallback] as unknown[];
      directive.data = { hName: "div", hProperties: { class: "diagram-outer" } };
    });
  };
  return transformer;
};

export default remarkDrawio;
