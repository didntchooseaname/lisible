// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Element, ElementContent } from "hast";
import { h } from "hastscript";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import {
  createRemarkDrawio,
  DIAGRAM_MAGNIFIER_PATH,
  DIAGRAM_RESET_PATHS,
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

const shapesIcon = () =>
  svg([
    h("path", {
      d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",
    }),
    h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
    h("circle", { cx: "17.5", cy: "17.5", r: "3.5" }),
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

const ctrlButton = (attr: string, label: string, iconEl: ElementContent): Element =>
  h("button", { type: "button", class: "drawio-btn", "aria-label": label, [attr]: "" }, [iconEl]);

export default createRemarkDrawio({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  stripLabel: true,
  render: ({ src, title, locale, body }) => {
    const labels = diagramStrings[locale];
    const heading = title || labels.diagram;

    const toolbar = {
      type: "drawioToolbar",
      data: {
        hName: "div",
        hProperties: { class: "drawio-toolbar" },
        hChildren: [
          h("span", { class: "drawio-label" }, [shapesIcon(), h("span", {}, heading)]),
          h("div", { class: "drawio-controls" }, [
            ctrlButton("data-drawio-zoom-out", labels.zoomOut, zoomOutIcon()),
            h("span", { class: "drawio-zoom-level", "data-drawio-zoom-level": "" }, "100%"),
            ctrlButton("data-drawio-zoom-in", labels.zoomIn, zoomInIcon()),
            ctrlButton("data-drawio-zoom-reset", labels.zoomReset, resetIcon()),
          ]),
        ],
      },
      children: [],
    };

    const pan = {
      type: "drawioPan",
      data: { hName: "div", hProperties: { class: "drawio-pan", "data-drawio-pan": "" } },
      children: body,
    };

    const viewport = {
      type: "drawioViewport",
      data: {
        hName: "div",
        hProperties: { class: "drawio-viewport", "data-drawio-viewport": "" },
      },
      children: [pan],
    };

    return {
      hName: "figure",
      hProperties: {
        class: "drawio-block not-prose",
        "data-drawio": "",
        "data-drawio-src": src ?? "",
      },
      children: [toolbar, viewport],
    };
  },
});
