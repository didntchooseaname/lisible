import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root, Code } from "mdast";
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

function buildViewer(code: string, locale: CardLocale): ElementContent {
  const labels = cardStrings[locale].diagram;
  const id = `mermaid-${(counter++).toString(36)}`;
  const encoded = Buffer.from(code, "utf-8").toString("base64");

  const zoomOut = h(
    "button",
    {
      type: "button",
      class: "diagram-btn",
      "data-mermaid-zoom-out": "",
      "aria-label": labels.zoomOut,
      title: labels.zoomOut,
    },
    [controlIcon([h("circle", { cx: "11", cy: "11", r: "8" }), h("path", { d: "m21 21-4.3-4.3" }), h("path", { d: "M8 11h6" })])],
  );
  const zoomIn = h(
    "button",
    {
      type: "button",
      class: "diagram-btn",
      "data-mermaid-zoom-in": "",
      "aria-label": labels.zoomIn,
      title: labels.zoomIn,
    },
    [controlIcon([h("circle", { cx: "11", cy: "11", r: "8" }), h("path", { d: "m21 21-4.3-4.3" }), h("path", { d: "M11 8v6" }), h("path", { d: "M8 11h6" })])],
  );
  const reset = h(
    "button",
    {
      type: "button",
      class: "diagram-btn",
      "data-mermaid-reset": "",
      "aria-label": labels.reset,
      title: labels.reset,
    },
    [controlIcon([h("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }), h("path", { d: "M3 3v5h5" })])],
  );
  const copy = h(
    "button",
    {
      type: "button",
      class: "diagram-btn",
      "data-mermaid-copy": "",
      "aria-label": labels.copy,
      title: labels.copy,
    },
    [controlIcon([h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }), h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })])],
  );

  return h("div", { class: "diagram-wrap", "data-mermaid": "", id }, [
    h("div", { class: "diagram-toolbar" }, [
      h("span", { class: "diagram-label" }, [
        controlIcon([h("rect", { x: "3", y: "3", width: "7", height: "7" }), h("rect", { x: "14", y: "3", width: "7", height: "7" }), h("rect", { x: "3", y: "14", width: "7", height: "7" }), h("rect", { x: "14", y: "14", width: "7", height: "7" })]),
        h("span", {}, labels.label),
      ]),
      h("div", { class: "diagram-controls" }, [
        zoomOut,
        h("span", { class: "diagram-zoom-level", "data-mermaid-zoom-level": "" }, "100%"),
        zoomIn,
        reset,
        copy,
      ]),
    ]),
    h("div", { class: "diagram-viewport", "data-mermaid-viewport": "", style: "cursor:grab" }, [
      h("div", { class: "diagram-pan", "data-mermaid-pan": "" }, [
        h("div", { class: "diagram-render", "data-mermaid-render": "" }),
      ]),
      h("div", { class: "diagram-loading", "data-mermaid-loading": "" }, [
        h(
          "svg",
          {
            class: "diagram-spinner",
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            width: "18",
            height: "18",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "aria-hidden": "true",
          },
          [h("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })],
        ),
        h("span", {}, labels.rendering),
      ]),
      h("div", { class: "diagram-hint", "data-mermaid-hint": "" }, labels.hint),
    ]),
    h("pre", { class: "diagram-source", "data-mermaid-source": encoded, hidden: true }, code),
  ]);
}

const remarkMermaid: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid") return;
      const data = (node as unknown as { data?: Record<string, unknown> }).data ?? {};
      (node as unknown as { data: Record<string, unknown> }).data = data;
      data.hName = "div";
      data.hProperties = { class: "diagram-outer" };
      data.hChildren = [buildViewer(node.value, locale)];
    });
  };
  return transformer;
};

export default remarkMermaid;
