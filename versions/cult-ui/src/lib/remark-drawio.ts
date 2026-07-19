import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const LABELS = {
  fr: {
    diagram: "Schema draw.io",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arriere",
    reset: "Reinitialiser la vue",
  },
  en: {
    diagram: "draw.io diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
  },
} as const;

const remarkDrawio: Plugin<[], Root> = () => {
  return (tree, file) => {
    const locale = file.path?.includes("/blog/en/") ? "en" : "fr";
    const labels = LABELS[locale];

    visit(tree, "containerDirective", (node) => {
      if (node.name !== "drawio") return;

      const attributes = (node.attributes ?? {}) as Record<string, string>;
      const src = attributes.src ?? "";
      const title = attributes.title ?? labels.diagram;

      const data = node.data ?? (node.data = {});
      data.hName = "div";
      data.hProperties = {
        class: "drawio-embed not-prose",
        "data-drawio": "",
        "data-drawio-src": src,
        "data-drawio-title": title,
        "data-label-zoomin": labels.zoomIn,
        "data-label-zoomout": labels.zoomOut,
        "data-label-reset": labels.reset,
      };
    });
  };
};

export default remarkDrawio;
