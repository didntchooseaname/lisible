// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { h } from "hastscript";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import {
  createRemarkMermaid,
  DIAGRAM_COPY_PATH,
  DIAGRAM_MAGNIFIER_PATH,
  DIAGRAM_RESET_PATHS,
  DIAGRAM_SPINNER_PATH,
} from "../../../../shared/markdown/remark-diagram";
import { type CardLocale, cardLocaleFromPath, cardStrings } from "../i18n/cards";

const controlIcon = (children: ElementContent[]): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
    },
    children,
  );

let counter = 0;

function buildViewer(code: string, encoded: string, locale: CardLocale): ElementContent {
  const labels = cardStrings[locale].diagram;
  const id = `mermaid-${(counter++).toString(36)}`;

  const button = (hook: string, label: string, paths: ElementContent[]) =>
    h(
      "button",
      { type: "button", class: "diagram-btn", [hook]: "", "aria-label": label, title: label },
      [controlIcon(paths)],
    );

  const zoomOut = button("data-mermaid-zoom-out", labels.zoomOut, [
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
    h("path", { d: "M8 11h6" }),
  ]);
  const zoomIn = button("data-mermaid-zoom-in", labels.zoomIn, [
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
    h("path", { d: "M11 8v6" }),
    h("path", { d: "M8 11h6" }),
  ]);
  const reset = button(
    "data-mermaid-reset",
    labels.reset,
    DIAGRAM_RESET_PATHS.map((d) => h("path", { d })),
  );
  const copy = button("data-mermaid-copy", labels.copy, [
    h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
    h("path", { d: DIAGRAM_COPY_PATH }),
  ]);

  return h("div", { class: "diagram-wrap", "data-mermaid": "", id }, [
    h("div", { class: "diagram-toolbar" }, [
      h("span", { class: "diagram-label" }, [
        controlIcon([
          h("rect", { x: "3", y: "3", width: "7", height: "7" }),
          h("rect", { x: "14", y: "3", width: "7", height: "7" }),
          h("rect", { x: "3", y: "14", width: "7", height: "7" }),
          h("rect", { x: "14", y: "14", width: "7", height: "7" }),
        ]),
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
          [h("path", { d: DIAGRAM_SPINNER_PATH })],
        ),
        h("span", {}, labels.rendering),
      ]),
      h("div", { class: "diagram-hint", "data-mermaid-hint": "" }, labels.hint),
    ]),
    h("pre", { class: "diagram-source", "data-mermaid-source": encoded, hidden: true }, code),
  ]);
}

export default createRemarkMermaid({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  render: ({ code, encoded, locale }) => ({
    kind: "code-data",
    hName: "div",
    hProperties: { class: "diagram-outer" },
    hChildren: [buildViewer(code, encoded, locale)],
  }),
});
