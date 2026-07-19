import { h, s } from "hastscript";
import type { Root } from "mdast";
import type { Transformer } from "unified";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";

type Variant = "note" | "tip" | "warning" | "caution" | "important";

const VARIANTS = new Set<Variant>([
  "note",
  "tip",
  "warning",
  "caution",
  "important",
]);

const TITLES: Record<"fr" | "en", Record<Variant, string>> = {
  fr: {
    note: "Note",
    tip: "Astuce",
    warning: "Avertissement",
    caution: "Attention",
    important: "Important",
  },
  en: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
};

const ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

const ICON_PATHS: Record<Variant, string[]> = {
  note: ["M12 16v-4", "M12 8h.01"],
  tip: [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4",
  ],
  warning: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    "M12 9v4",
    "M12 17h.01",
  ],
  caution: [
    "M12 16h.01",
    "M12 8v4",
    "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
  ],
  important: [
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    "M12 7v2",
    "M12 13h.01",
  ],
};

function icon(variant: Variant) {
  const children =
    variant === "note"
      ? [s("circle", { cx: "12", cy: "12", r: "10" }), ...ICON_PATHS.note.map((d) => s("path", { d }))]
      : ICON_PATHS[variant].map((d) => s("path", { d }));
  return s("svg", { ...ICON_ATTRS, class: "callout__icon" }, children);
}

function fileLocale(file: VFile): "fr" | "en" {
  const path = (file.path || file.history[0] || "").replace(/\\/g, "/");
  return path.includes("/blog/en/") ? "en" : "fr";
}

function textOf(node: any): string {
  if (node == null) return "";
  if (typeof node.value === "string") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

export function remarkCallouts() {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = fileLocale(file);

    visit(tree, "containerDirective", (node: any) => {
      const name = node.name as Variant;
      if (!VARIANTS.has(name)) return;

      const attributes = node.attributes || {};
      const collapse = "collapse" in attributes;

      let title = TITLES[locale][name];
      const first = node.children[0];
      if (first && first.data && first.data.directiveLabel) {
        const custom = textOf(first).trim();
        if (custom) title = custom;
        node.children.shift();
      }

      const header = {
        type: "paragraph",
        data: {
          hName: collapse ? "summary" : "div",
          hProperties: { className: ["callout__title"] },
          hChildren: [
            icon(name),
            h("span", { class: "callout__title-text" }, title),
          ],
        },
        children: [],
      };

      node.children.unshift(header as any);

      node.data = node.data || {};
      node.data.hName = collapse ? "details" : "aside";
      node.data.hProperties = {
        className: [
          "callout",
          `callout-${name}`,
          ...(collapse ? ["callout-collapsible"] : []),
        ],
      };
    });
  };

  return transformer;
}
