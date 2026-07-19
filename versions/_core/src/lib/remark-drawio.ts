import { h } from "hastscript";
import type { Element, ElementContent } from "hast";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, diagramStrings } from "#src/i18n/diagrams";

const svg = (paths: ElementContent[], size = "16"): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
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
    h("path", { d: "m21 21-4.3-4.3" }),
    h("path", { d: "M8 11h6" }),
  ]);

const zoomInIcon = () =>
  svg([
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: "m21 21-4.3-4.3" }),
    h("path", { d: "M11 8v6" }),
    h("path", { d: "M8 11h6" }),
  ]);

const resetIcon = () =>
  svg([
    h("path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
    h("path", { d: "M3 3v5h5" }),
  ]);

const ctrlButton = (attr: string, label: string, iconEl: ElementContent): Element =>
  h("button", { type: "button", class: "drawio-btn", "aria-label": label, [attr]: "" }, [iconEl]);

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
    directiveLabel?: boolean;
  };
}

const remarkDrawio: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);
    const labels = diagramStrings[locale];

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective" || directive.name !== "drawio") return;

      const src = directive.attributes?.src ?? "";
      const title = directive.attributes?.title || labels.diagram;
      const children = (directive.children ?? []) as DirectiveNode[];
      const body = children[0]?.data?.directiveLabel ? children.slice(1) : children;

      const toolbar: DirectiveNode = {
        type: "drawioToolbar",
        data: {
          hName: "div",
          hProperties: { class: "drawio-toolbar" },
          hChildren: [
            h("span", { class: "drawio-label" }, [shapesIcon(), h("span", {}, title)]),
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

      const pan: DirectiveNode = {
        type: "drawioPan",
        data: { hName: "div", hProperties: { class: "drawio-pan", "data-drawio-pan": "" } },
        children: body,
      };

      const viewport: DirectiveNode = {
        type: "drawioViewport",
        data: { hName: "div", hProperties: { class: "drawio-viewport", "data-drawio-viewport": "" } },
        children: [pan],
      };

      directive.data = directive.data ?? {};
      directive.data.hName = "figure";
      directive.data.hProperties = {
        class: "drawio-block not-prose",
        "data-drawio": "",
        "data-drawio-src": src,
      };
      directive.children = [toolbar, viewport];
    });
  };

  return transformer;
};

export default remarkDrawio;
