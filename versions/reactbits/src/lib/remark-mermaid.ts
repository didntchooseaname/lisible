// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { Properties } from "hast";
import { h, s } from "hastscript";
import {
  createRemarkMermaid,
  DIAGRAM_COPY_PATH,
  DIAGRAM_MAGNIFIER_PATH,
  DIAGRAM_RESET_PATHS,
} from "../../../../shared/markdown/remark-diagram";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const iconBtn = (paths: Array<[string, Record<string, unknown>]>, extra: Record<string, unknown>) =>
  h("button", { type: "button", class: "mermaid-btn", ...extra }, [
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

let counter = 0;

export default createRemarkMermaid({
  locale: (file): Locale => (/[\\/]en[\\/]/.test(file?.path ?? "") ? "en" : defaultLocale),
  render: ({ code, encoded, locale }) => {
    const dict = ui[locale].diagram;
    const id = `mermaid-${(counter += 1)}`;

    const toolbar = h("div", { class: "mermaid-toolbar" }, [
      h("span", { class: "mermaid-label" }, [
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
            s("path", { d: "M3 3h7v7H3z" }),
            s("path", { d: "M14 3h7v7h-7z" }),
            s("path", { d: "M3 14h7v7H3z" }),
            s("path", { d: "M14 14h7v7h-7z" }),
          ],
        ),
        h("span", {}, [dict.label]),
      ]),
      h("div", { class: "mermaid-actions" }, [
        iconBtn(
          [
            ["circle", { cx: 11, cy: 11, r: 8 }],
            ["path", { d: DIAGRAM_MAGNIFIER_PATH }],
            ["path", { d: "M8 11h6" }],
          ],
          { "data-mermaid-zoom-out": "", "aria-label": dict.zoomOut },
        ),
        h("span", { class: "mermaid-zoom-level", "data-mermaid-zoom-level": "" }, ["100%"]),
        iconBtn(
          [
            ["circle", { cx: 11, cy: 11, r: 8 }],
            ["path", { d: DIAGRAM_MAGNIFIER_PATH }],
            ["path", { d: "M11 8v6" }],
            ["path", { d: "M8 11h6" }],
          ],
          { "data-mermaid-zoom-in": "", "aria-label": dict.zoomIn },
        ),
        iconBtn(
          DIAGRAM_RESET_PATHS.map((d) => ["path", { d }] as [string, Record<string, unknown>]),
          { "data-mermaid-zoom-reset": "", "aria-label": dict.reset },
        ),
        iconBtn(
          [
            ["rect", { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }],
            ["path", { d: DIAGRAM_COPY_PATH }],
          ],
          { "data-mermaid-copy": "", "aria-label": dict.copy },
        ),
      ]),
    ]);

    const viewport = h("div", { class: "mermaid-viewport", "data-mermaid-viewport": "" }, [
      h("div", { class: "mermaid-pan", "data-mermaid-pan": "" }, [
        h("div", { class: "mermaid-render", "data-mermaid-render": "" }),
      ]),
      h("div", { class: "mermaid-loading", "data-mermaid-loading": "" }, [dict.loading]),
      h("div", { class: "mermaid-hint", "data-mermaid-hint": "" }, [dict.hint]),
    ]);

    const fallback = h(
      "pre",
      {
        class: "mermaid-fallback",
        "data-mermaid-fallback": "",
        hidden: true,
      },
      [code],
    );

    const source = h("div", {
      "data-mermaid-source": encoded,
      hidden: true,
    });

    return {
      kind: "element",
      nodeType: "paragraph",
      hName: "div",
      hProperties: {
        class: "mermaid-block not-prose",
        "data-mermaid-container": "",
        id,
      },
      hChildren: [toolbar, viewport, fallback, source],
    };
  },
});
