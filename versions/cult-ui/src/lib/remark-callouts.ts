import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Paragraph, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type Variant = "note" | "tip" | "warning" | "caution" | "important";

const VARIANTS = new Set<Variant>([
  "note",
  "tip",
  "warning",
  "caution",
  "important",
]);

const ICON_PATHS: Record<Variant, string[]> = {
  note: ["M12 16v-4", "M12 8h.01", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"],
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
    "M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z",
    "M12 8v4",
    "M12 16h.01",
  ],
  important: [
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    "M12 7v2",
    "M12 13h.01",
  ],
};

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

function icon(variant: Variant): ElementContent {
  return h(
    "svg",
    {
      class: "callout-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    ICON_PATHS[variant].map((d) => h("path", { d })),
  );
}

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      class: "callout-chevron",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [h("path", { d: "m6 9 6 6 6-6" })],
  );

function paragraphText(node: Paragraph): string {
  let out = "";
  visit(node, "text", (t) => {
    out += t.value;
  });
  return out;
}

const remarkCallouts: Plugin<[], Root> = () => {
  return (tree, file) => {
    const locale = file.path?.includes("/blog/en/") ? "en" : "fr";

    visit(tree, "containerDirective", (node) => {
      const name = node.name as Variant;
      if (!VARIANTS.has(name)) return;

      const attributes = (node.attributes ?? {}) as Record<string, unknown>;
      const collapsible = "collapse" in attributes;

      let title = TITLES[locale][name];
      const bodyChildren = [...node.children];
      const labelIndex = bodyChildren.findIndex(
        (child) =>
          child.type === "paragraph" &&
          (child.data as { directiveLabel?: boolean } | undefined)
            ?.directiveLabel,
      );
      if (labelIndex !== -1) {
        title = paragraphText(bodyChildren[labelIndex] as Paragraph) || title;
        bodyChildren.splice(labelIndex, 1);
      }

      const titleSpan = h("span", { class: "callout-title" }, title);
      const data = node.data ?? (node.data = {});

      if (collapsible) {
        data.hName = "details";
        data.hProperties = { class: `callout callout-${name}` };
        node.children = [
          {
            type: "paragraph",
            data: {
              hName: "summary",
              hProperties: { class: "callout-header" },
              hChildren: [icon(name), titleSpan, chevron()],
            },
            children: [],
          },
          {
            type: "paragraph",
            data: { hName: "div", hProperties: { class: "callout-body" } },
            children: bodyChildren,
          },
        ];
      } else {
        data.hName = "aside";
        data.hProperties = { class: `callout callout-${name}`, role: "note" };
        node.children = [
          {
            type: "paragraph",
            data: {
              hName: "div",
              hProperties: { class: "callout-header" },
              hChildren: [icon(name), titleSpan],
            },
            children: [],
          },
          {
            type: "paragraph",
            data: { hName: "div", hProperties: { class: "callout-body" } },
            children: bodyChildren,
          },
        ];
      }
    });
  };
};

export default remarkCallouts;
