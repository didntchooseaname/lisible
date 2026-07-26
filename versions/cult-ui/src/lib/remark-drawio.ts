// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import { createRemarkDrawio } from "../../../../shared/markdown/remark-diagram";

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

export default createRemarkDrawio({
  locale: (file): "fr" | "en" => (file?.path?.includes("/blog/en/") ? "en" : "fr"),
  render: ({ src, title, locale }) => {
    const labels = LABELS[locale];

    return {
      hName: "div",
      hProperties: {
        class: "drawio-embed not-prose",
        "data-drawio": "",
        "data-drawio-src": src ?? "",
        "data-drawio-title": title ?? labels.diagram,
        "data-label-zoomin": labels.zoomIn,
        "data-label-zoomout": labels.zoomOut,
        "data-label-reset": labels.reset,
      },
    };
  },
});
