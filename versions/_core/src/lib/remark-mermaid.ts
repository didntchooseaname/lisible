// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Element, ElementContent } from "hast";
import { h } from "hastscript";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import {
  createRemarkMermaid,
  DIAGRAM_MAGNIFIER_PATH,
  DIAGRAM_RESET_PATHS,
  DIAGRAM_SPINNER_PATH,
} from "../../../../shared/markdown/remark-diagram";
import { cardLocaleFromPath, diagramStrings } from "../i18n/diagrams";

const svg = (paths: ElementContent[], size = "16"): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      ...STROKE_ICON_ATTRS,
    },
    paths,
  );

const gridIcon = () =>
  svg([
    h("rect", { width: "7", height: "7", x: "3", y: "3", rx: "1" }),
    h("rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }),
    h("rect", { width: "7", height: "7", x: "14", y: "14", rx: "1" }),
    h("rect", { width: "7", height: "7", x: "3", y: "14", rx: "1" }),
  ]);

const zoomOutIcon = () =>
  svg([
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
    h("path", { d: "M8 11h6" }),
  ]);

const zoomInIcon = () =>
  svg([
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
    h("path", { d: "M11 8v6" }),
    h("path", { d: "M8 11h6" }),
  ]);

const resetIcon = () => svg(DIAGRAM_RESET_PATHS.map((d) => h("path", { d })));

const copyIcon = () =>
  svg([
    h("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
    h("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }),
  ]);

const spinnerIcon = () =>
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
      "aria-hidden": "true",
      class: "mermaid-spinner",
    },
    [h("path", { d: DIAGRAM_SPINNER_PATH })],
  );

const ctrlButton = (attr: string, label: string, iconEl: ElementContent): Element =>
  h("button", { type: "button", class: "mermaid-btn", "aria-label": label, [attr]: "" }, [iconEl]);

export default createRemarkMermaid({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  lowercaseLang: true,
  render: ({ code, encoded, locale }) => {
    const labels = diagramStrings[locale];

    const container = h("div", { class: "mermaid-block not-prose", "data-mermaid": "" }, [
      h("div", { class: "mermaid-toolbar" }, [
        h("span", { class: "mermaid-label" }, [gridIcon(), h("span", {}, labels.diagram)]),
        h("div", { class: "mermaid-controls" }, [
          ctrlButton("data-mermaid-zoom-out", labels.zoomOut, zoomOutIcon()),
          h("span", { class: "mermaid-zoom-level", "data-mermaid-zoom-level": "" }, "100%"),
          ctrlButton("data-mermaid-zoom-in", labels.zoomIn, zoomInIcon()),
          ctrlButton("data-mermaid-zoom-reset", labels.zoomReset, resetIcon()),
          ctrlButton("data-mermaid-copy", labels.copySource, copyIcon()),
        ]),
      ]),
      h("div", { class: "mermaid-viewport", "data-mermaid-viewport": "" }, [
        h("div", { class: "mermaid-pan", "data-mermaid-pan": "" }, [
          h("div", { class: "mermaid-render", "data-mermaid-render": "" }),
        ]),
        h("div", { class: "mermaid-loading", "data-mermaid-loading": "" }, [
          spinnerIcon(),
          h("span", {}, labels.loading),
        ]),
      ]),
      h("pre", { class: "mermaid-fallback", "data-mermaid-fallback": "", hidden: true }, code),
      h("span", { "data-mermaid-source": encoded, hidden: true }),
    ]);

    return {
      kind: "element",
      nodeType: "mermaidBlock",
      hName: "div",
      hProperties: { class: "mermaid-wrap" },
      hChildren: [container],
    };
  },
});
