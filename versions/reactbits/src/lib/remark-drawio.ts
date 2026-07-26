// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Properties } from "hast";
import { h, s } from "hastscript";
import {
  createRemarkDrawio,
  DIAGRAM_MAGNIFIER_PATH,
  DIAGRAM_RESET_PATHS,
} from "../../../../shared/markdown/remark-diagram";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const iconBtn = (paths: Array<[string, Record<string, unknown>]>, extra: Record<string, unknown>) =>
  h("button", { type: "button", class: "drawio-btn", ...extra }, [
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
      } as Properties,
      paths.map(([tag, attrs]) => s(tag, attrs as Properties)),
    ),
  ]);

export default createRemarkDrawio({
  locale: (file): Locale => (/[\\/]en[\\/]/.test(file?.path ?? "") ? "en" : defaultLocale),
  render: ({ src, title, locale, body }) => {
    const dict = ui[locale].drawio;
    const label = title ?? dict.label;

    const toolbar = {
      type: "paragraph",
      data: {
        hName: "div",
        hProperties: { class: "drawio-toolbar" },
        hChildren: [
          h("span", { class: "drawio-label" }, [
            s(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: 15,
                height: 15,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 1.5,
                "aria-hidden": "true",
              },
              [
                s("rect", { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
                s("rect", { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
                s("path", { d: "M10 6.5h4a2 2 0 0 1 2 2V14" }),
              ],
            ),
            h("span", {}, [label]),
          ]),
          h("div", { class: "drawio-actions" }, [
            iconBtn(
              [
                ["circle", { cx: 11, cy: 11, r: 8 }],
                ["path", { d: DIAGRAM_MAGNIFIER_PATH }],
                ["path", { d: "M8 11h6" }],
              ],
              { "data-drawio-zoom-out": "", "aria-label": dict.zoomOut },
            ),
            h("span", { class: "drawio-zoom-level", "data-drawio-zoom-level": "" }, ["100%"]),
            iconBtn(
              [
                ["circle", { cx: 11, cy: 11, r: 8 }],
                ["path", { d: DIAGRAM_MAGNIFIER_PATH }],
                ["path", { d: "M11 8v6" }],
                ["path", { d: "M8 11h6" }],
              ],
              { "data-drawio-zoom-in": "", "aria-label": dict.zoomIn },
            ),
            iconBtn(
              DIAGRAM_RESET_PATHS.map((d) => ["path", { d }] as [string, Record<string, unknown>]),
              { "data-drawio-zoom-reset": "", "aria-label": dict.reset },
            ),
          ]),
        ],
      },
      children: [],
    };

    return {
      hName: "figure",
      hProperties: {
        class: "drawio not-prose",
        "data-drawio": "",
        "data-src": src ?? "",
        "aria-label": label,
      },
      children: [toolbar, ...body],
    };
  },
});
