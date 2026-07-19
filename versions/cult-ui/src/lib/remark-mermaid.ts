import type { Code, Html, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const LABELS = {
  fr: {
    diagram: "Diagramme",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arriere",
    reset: "Reinitialiser la vue",
    error: "Echec du rendu du diagramme",
  },
  en: {
    diagram: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    error: "Failed to render diagram",
  },
} as const;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const remarkMermaid: Plugin<[], Root> = () => {
  return (tree, file) => {
    const locale = file.path?.includes("/blog/en/") ? "en" : "fr";
    const labels = LABELS[locale];

    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid") return;
      const encoded = Buffer.from(node.value, "utf-8").toString("base64");
      const attrs = [
        `class="mermaid-embed not-prose"`,
        `data-mermaid`,
        `data-mermaid-src="${encoded}"`,
        `data-label-diagram="${escapeAttr(labels.diagram)}"`,
        `data-label-zoomin="${escapeAttr(labels.zoomIn)}"`,
        `data-label-zoomout="${escapeAttr(labels.zoomOut)}"`,
        `data-label-reset="${escapeAttr(labels.reset)}"`,
        `data-label-error="${escapeAttr(labels.error)}"`,
      ].join(" ");

      const html =
        `<div ${attrs}>` +
        `<div class="mermaid-render" data-mermaid-render></div>` +
        `<div class="mermaid-fallback" data-mermaid-fallback>${escapeText(node.value)}</div>` +
        `</div>`;

      const htmlNode = node as unknown as Html;
      htmlNode.type = "html";
      htmlNode.value = html;
    });
  };
};

export default remarkMermaid;
