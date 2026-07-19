import { h, s } from "hastscript";
import type { Code, Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { ui, defaultLocale, type Locale } from "#src/i18n/ui";

const iconBtn = (
  paths: Array<[string, Record<string, unknown>]>,
  extra: Record<string, unknown>,
) =>
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
      },
      paths.map(([tag, attrs]) => s(tag, attrs)),
    ),
  ]);

let counter = 0;

const remarkMermaid: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const filePath = file?.path ?? "";
    const locale: Locale = /[\\/]en[\\/]/.test(filePath) ? "en" : defaultLocale;
    const dict = ui[locale].diagram;

    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid") return;
      const code = node.value ?? "";
      const id = `mermaid-${(counter += 1)}`;
      const encoded = Buffer.from(code, "utf-8").toString("base64");

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
              ["path", { d: "m21 21-4.3-4.3" }],
              ["path", { d: "M8 11h6" }],
            ],
            { "data-mermaid-zoom-out": "", "aria-label": dict.zoomOut },
          ),
          h(
            "span",
            { class: "mermaid-zoom-level", "data-mermaid-zoom-level": "" },
            ["100%"],
          ),
          iconBtn(
            [
              ["circle", { cx: 11, cy: 11, r: 8 }],
              ["path", { d: "m21 21-4.3-4.3" }],
              ["path", { d: "M11 8v6" }],
              ["path", { d: "M8 11h6" }],
            ],
            { "data-mermaid-zoom-in": "", "aria-label": dict.zoomIn },
          ),
          iconBtn(
            [
              ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
              ["path", { d: "M3 3v5h5" }],
            ],
            { "data-mermaid-zoom-reset": "", "aria-label": dict.reset },
          ),
          iconBtn(
            [
              ["rect", { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }],
              ["path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }],
            ],
            { "data-mermaid-copy": "", "aria-label": dict.copy },
          ),
        ]),
      ]);

      const viewport = h(
        "div",
        { class: "mermaid-viewport", "data-mermaid-viewport": "" },
        [
          h("div", { class: "mermaid-pan", "data-mermaid-pan": "" }, [
            h("div", { class: "mermaid-render", "data-mermaid-render": "" }),
          ]),
          h(
            "div",
            { class: "mermaid-loading", "data-mermaid-loading": "" },
            [dict.loading],
          ),
          h("div", { class: "mermaid-hint", "data-mermaid-hint": "" }, [
            dict.hint,
          ]),
        ],
      );

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

      const mutable = node as unknown as {
        type: string;
        value?: string;
        lang?: string | null;
        meta?: string | null;
        children: unknown[];
        data: Record<string, unknown>;
      };
      mutable.type = "paragraph";
      delete mutable.value;
      delete mutable.lang;
      delete mutable.meta;
      mutable.children = [];
      mutable.data = {
        hName: "div",
        hProperties: {
          class: "mermaid-block not-prose",
          "data-mermaid-container": "",
          id,
        },
        hChildren: [toolbar, viewport, fallback, source],
      };
    });
  };

  return transformer;
};

export default remarkMermaid;
