// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { h } from "hastscript";
import { STROKE_ICON_ATTRS } from "../../../../shared/markdown/remark-callouts";
import {
  createRemarkDrawio,
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

function buildToolbarAndViewport(locale: CardLocale, _id: string): ElementContent[] {
  const labels = cardStrings[locale].diagram;
  const btn = (hook: string, label: string, paths: ElementContent[]) =>
    h(
      "button",
      { type: "button", class: "diagram-btn", [hook]: "", "aria-label": label, title: label },
      [controlIcon(paths)],
    );

  const toolbar = h("div", { class: "diagram-toolbar" }, [
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
      btn("data-drawio-zoom-out", labels.zoomOut, [
        h("circle", { cx: "11", cy: "11", r: "8" }),
        h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
        h("path", { d: "M8 11h6" }),
      ]),
      h("span", { class: "diagram-zoom-level", "data-drawio-zoom-level": "" }, "100%"),
      btn("data-drawio-zoom-in", labels.zoomIn, [
        h("circle", { cx: "11", cy: "11", r: "8" }),
        h("path", { d: DIAGRAM_MAGNIFIER_PATH }),
        h("path", { d: "M11 8v6" }),
        h("path", { d: "M8 11h6" }),
      ]),
      btn(
        "data-drawio-reset",
        labels.reset,
        DIAGRAM_RESET_PATHS.map((d) => h("path", { d })),
      ),
    ]),
  ]);

  const viewport = h(
    "div",
    { class: "diagram-viewport", "data-drawio-viewport": "", style: "cursor:grab" },
    [
      h("div", { class: "diagram-pan", "data-drawio-pan": "" }, [
        h("div", { class: "diagram-render", "data-drawio-render": "" }),
      ]),
      h("div", { class: "diagram-loading", "data-drawio-loading": "" }, [
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
      h("div", { class: "diagram-hint", "data-drawio-hint": "" }, labels.hint),
    ],
  );

  return [toolbar, viewport];
}

export default createRemarkDrawio({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  render: ({ src, title, locale, body }) => {
    if (!src) {
      return {
        hName: "div",
        hProperties: { style: "display:none" },
        hChildren: [],
        children: [],
      };
    }

    const label = title ?? cardStrings[locale].diagram.label;
    const id = `drawio-${(counter++).toString(36)}`;

    const viewer = {
      type: "paragraph",
      children: [],
      data: {
        hName: "div",
        hProperties: {
          class: "diagram-wrap",
          "data-drawio": "",
          "data-src": src,
          "data-title": label,
          id,
        },
        hChildren: buildToolbarAndViewport(locale, id),
      },
    };
    const fallback = {
      type: "drawioFallback",
      children: body,
      data: {
        hName: "div",
        hProperties: { class: "diagram-fallback", "data-drawio-fallback": "" },
      },
    };

    return {
      hName: "div",
      hProperties: { class: "diagram-outer" },
      children: [viewer, fallback],
    };
  },
});
