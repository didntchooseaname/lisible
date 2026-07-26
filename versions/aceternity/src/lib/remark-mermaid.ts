// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { h, s } from "hastscript";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import {
  createRemarkMermaid,
  DIAGRAM_COPY_PATH,
  DIAGRAM_RESET_PATHS,
  DIAGRAM_SPINNER_PATH,
} from "../../../../shared/markdown/remark-diagram";

const LABELS = {
  fr: {
    label: "Diagramme",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser la vue",
    copy: "Copier la source",
  },
  en: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    copy: "Copy source",
  },
} as const;

const CTRL_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  ...STROKE_ICON_ATTRS,
} as const;

const svg = (children: any[]) => s("svg", { ...CTRL_ATTRS }, children);

const iconLabel = () =>
  s("svg", { ...CTRL_ATTRS, "stroke-width": "1.5", class: "mermaid-toolbar__glyph" }, [
    s("path", { d: "M3 3h7v7H3z" }),
    s("path", { d: "M14 3h7v7h-7z" }),
    s("path", { d: "M3 14h7v7H3z" }),
    s("path", { d: "M14 14h7v7h-7z" }),
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

const iconReset = () => svg(DIAGRAM_RESET_PATHS.map((d) => s("path", { d })));

const iconCopy = () =>
  svg([
    s("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
    s("path", { d: DIAGRAM_COPY_PATH }),
  ]);

const iconSpinner = () =>
  s("svg", { ...CTRL_ATTRS, class: "mermaid-spinner", width: "18", height: "18" }, [
    s("path", { d: DIAGRAM_SPINNER_PATH }),
  ]);

let counter = 0;

export const remarkMermaid = createRemarkMermaid({
  locale: (file): "fr" | "en" => {
    const path = (file?.path || file?.history?.[0] || "").replace(/\\/g, "/");
    return path.includes("/blog/en/") ? "en" : "fr";
  },
  render: ({ code, encoded, locale }) => {
    const t = LABELS[locale];
    const id = `mermaid-${(counter++).toString(36)}`;

    const container = h("figure", { class: "mermaid-block not-prose", "data-mermaid": "", id }, [
      h("div", { class: "mermaid-toolbar" }, [
        h("span", { class: "mermaid-toolbar__label" }, [iconLabel(), h("span", {}, t.label)]),
        h("div", { class: "mermaid-toolbar__actions" }, [
          h(
            "button",
            {
              type: "button",
              class: "mermaid-btn",
              "data-mermaid-zoom-out": "",
              "aria-label": t.zoomOut,
            },
            [iconZoomOut()],
          ),
          h(
            "span",
            { class: "mermaid-zoom-level tabular-nums", "data-mermaid-zoom-level": "" },
            "100%",
          ),
          h(
            "button",
            {
              type: "button",
              class: "mermaid-btn",
              "data-mermaid-zoom-in": "",
              "aria-label": t.zoomIn,
            },
            [iconZoomIn()],
          ),
          h(
            "button",
            {
              type: "button",
              class: "mermaid-btn",
              "data-mermaid-reset": "",
              "aria-label": t.reset,
            },
            [iconReset()],
          ),
          h(
            "button",
            {
              type: "button",
              class: "mermaid-btn",
              "data-mermaid-copy": "",
              "aria-label": t.copy,
            },
            [iconCopy()],
          ),
        ]),
      ]),
      h("div", { class: "mermaid-viewport", "data-mermaid-viewport": "" }, [
        h("div", { class: "mermaid-pan", "data-mermaid-pan": "" }, [
          h("div", { class: "mermaid-render", "data-mermaid-render": "" }),
        ]),
        h("div", { class: "mermaid-loading", "data-mermaid-loading": "" }, [iconSpinner()]),
      ]),
      h("div", { "data-mermaid-source": encoded, hidden: true }),
      h("pre", { class: "mermaid-fallback", hidden: true }, code),
    ]);

    return {
      kind: "element",
      nodeType: "mermaid",
      hName: container.tagName,
      hProperties: container.properties as Record<string, unknown>,
      hChildren: container.children,
    };
  },
});
