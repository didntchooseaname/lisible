import { h, s } from "hastscript";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { ui, defaultLocale, type Locale } from "#src/i18n/ui";

const iconBtn = (
  paths: Array<[string, Record<string, unknown>]>,
  extra: Record<string, unknown>,
) =>
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
      },
      paths.map(([tag, attrs]) => s(tag, attrs)),
    ),
  ]);

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined>;
  children: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const remarkDrawio: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const filePath = file?.path ?? "";
    const locale: Locale = /[\\/]en[\\/]/.test(filePath) ? "en" : defaultLocale;
    const dict = ui[locale].drawio;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      if (directive.name !== "drawio") return;

      const src = directive.attributes?.src ?? "";
      const title = directive.attributes?.title ?? dict.label;

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
              h("span", {}, [title]),
            ]),
            h("div", { class: "drawio-actions" }, [
              iconBtn(
                [
                  ["circle", { cx: 11, cy: 11, r: 8 }],
                  ["path", { d: "m21 21-4.3-4.3" }],
                  ["path", { d: "M8 11h6" }],
                ],
                { "data-drawio-zoom-out": "", "aria-label": dict.zoomOut },
              ),
              h(
                "span",
                { class: "drawio-zoom-level", "data-drawio-zoom-level": "" },
                ["100%"],
              ),
              iconBtn(
                [
                  ["circle", { cx: 11, cy: 11, r: 8 }],
                  ["path", { d: "m21 21-4.3-4.3" }],
                  ["path", { d: "M11 8v6" }],
                  ["path", { d: "M8 11h6" }],
                ],
                { "data-drawio-zoom-in": "", "aria-label": dict.zoomIn },
              ),
              iconBtn(
                [
                  [
                    "path",
                    { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" },
                  ],
                  ["path", { d: "M3 3v5h5" }],
                ],
                { "data-drawio-zoom-reset": "", "aria-label": dict.reset },
              ),
            ]),
          ],
        },
        children: [],
      };

      directive.children.unshift(toolbar as never);

      directive.data ??= {};
      directive.data.hName = "figure";
      directive.data.hProperties = {
        class: "drawio not-prose",
        "data-drawio": "",
        "data-src": src,
        "aria-label": title,
      };
    });
  };

  return transformer;
};

export default remarkDrawio;
