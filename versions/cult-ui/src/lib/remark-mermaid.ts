// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkMermaid } from "../../../../shared/markdown/remark-diagram";

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
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default createRemarkMermaid({
  locale: (file): "fr" | "en" => (file?.path?.includes("/blog/en/") ? "en" : "fr"),
  render: ({ code, encoded, locale }) => {
    const labels = LABELS[locale];
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

    return {
      kind: "html",
      value:
        `<div ${attrs}>` +
        `<div class="mermaid-render" data-mermaid-render></div>` +
        `<div class="mermaid-fallback" data-mermaid-fallback>${escapeText(code)}</div>` +
        `</div>`,
    };
  },
});
