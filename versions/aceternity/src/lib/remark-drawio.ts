import { h, s } from "hastscript";
import type { Root } from "mdast";
import type { Transformer } from "unified";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";

const LABELS = {
  fr: { label: "Diagramme", zoomIn: "Zoomer", zoomOut: "Dézoomer", reset: "Réinitialiser la vue" },
  en: { label: "Diagram", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset view" },
} as const;

const CTRL_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

const svg = (children: any[]) => s("svg", { ...CTRL_ATTRS }, children);

const iconLabel = () =>
  s("svg", { ...CTRL_ATTRS, "stroke-width": "1.5", class: "drawio-toolbar__glyph" }, [
    s("line", { x1: "22", y1: "6", x2: "2", y2: "6" }),
    s("line", { x1: "22", y1: "18", x2: "2", y2: "18" }),
    s("line", { x1: "6", y1: "2", x2: "6", y2: "22" }),
    s("line", { x1: "18", y1: "2", x2: "18", y2: "22" }),
  ]);

const iconZoomOut = () =>
  svg([
    s("circle", { cx: "11", cy: "11", r: "8" }),
    s("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
    s("line", { x1: "8", y1: "11", x2: "14", y2: "11" }),
  ]);

const iconZoomIn = () =>
  svg([
    s("circle", { cx: "11", cy: "11", r: "8" }),
    s("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
    s("line", { x1: "11", y1: "8", x2: "11", y2: "14" }),
    s("line", { x1: "8", y1: "11", x2: "14", y2: "11" }),
  ]);

const iconReset = () =>
  svg([
    s("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
    s("path", { d: "M3 3v5h5" }),
  ]);

function fileLocale(file: VFile): "fr" | "en" {
  const path = (file.path || file.history[0] || "").replace(/\\/g, "/");
  return path.includes("/blog/en/") ? "en" : "fr";
}

export function remarkDrawio() {
  const transformer: Transformer<Root> = (tree, file) => {
    const t = LABELS[fileLocale(file)];

    visit(tree, "containerDirective", (node: any) => {
      if (node.name !== "drawio") return;

      const attributes = node.attributes || {};
      const src: string = attributes.src || "";
      const title: string = attributes.title || t.label;

      if (node.children[0]?.data?.directiveLabel) node.children.shift();

      const originalChildren = node.children;

      const toolbar = {
        type: "paragraph",
        data: {
          hName: "div",
          hProperties: { className: ["drawio-toolbar"] },
          hChildren: [
            h("span", { class: "drawio-toolbar__label" }, [iconLabel(), h("span", {}, title)]),
            h("div", { class: "drawio-toolbar__actions" }, [
              h("button", { type: "button", class: "drawio-btn", "data-drawio-zoom-out": "", "aria-label": t.zoomOut }, [iconZoomOut()]),
              h("span", { class: "drawio-zoom-level tabular-nums", "data-drawio-zoom-level": "" }, "100%"),
              h("button", { type: "button", class: "drawio-btn", "data-drawio-zoom-in": "", "aria-label": t.zoomIn }, [iconZoomIn()]),
              h("button", { type: "button", class: "drawio-btn", "data-drawio-reset": "", "aria-label": t.reset }, [iconReset()]),
            ]),
          ],
        },
        children: [],
      };

      const pan = {
        type: "paragraph",
        data: { hName: "div", hProperties: { className: ["drawio-pan"], "data-drawio-pan": "" } },
        children: originalChildren,
      };

      const viewport = {
        type: "paragraph",
        data: { hName: "div", hProperties: { className: ["drawio-viewport"], "data-drawio-viewport": "" } },
        children: [pan],
      };

      node.children = [toolbar as any, viewport as any];
      node.data = node.data || {};
      node.data.hName = "figure";
      node.data.hProperties = {
        className: ["drawio-block", "not-prose"],
        "data-drawio": "",
        "data-drawio-src": src,
      };
    });
  };

  return transformer;
}
