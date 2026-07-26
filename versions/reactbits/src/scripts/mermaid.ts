import { resolveRgb } from "@/lib/kit";

import { createMermaidClient } from "../../../../shared/scripts/mermaid";
import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

function themeVariables() {
  const t = (name: string) => {
    const { r, g, b } = resolveRgb(`var(${name})`);
    return `rgb(${r}, ${g}, ${b})`;
  };
  const bg = t("--color-background");
  const card = t("--color-card");
  const secondary = t("--color-secondary");
  const fg = t("--color-foreground");
  const border = t("--color-border");
  const mutedFg = t("--color-muted-foreground");
  return {
    background: bg,
    primaryColor: secondary,
    primaryTextColor: fg,
    primaryBorderColor: border,
    secondaryColor: card,
    tertiaryColor: card,
    lineColor: mutedFg,
    mainBkg: secondary,
    nodeBorder: border,
    clusterBkg: card,
    clusterBorder: border,
    titleColor: fg,
    edgeLabelBackground: bg,
    noteBkgColor: secondary,
    noteTextColor: fg,
    noteBorderColor: border,
  };
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid-container]",
  requires: ["[data-mermaid-viewport]", "[data-mermaid-pan]"],
  config: () => ({
    theme: "base",
    fontFamily: "var(--font-sans)",
    securityLevel: "loose",
    themeVariables: themeVariables(),
  }),
  diagramId: (container) => container.id,
  onError: (container, error) => {
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) fallback.hidden = false;
    console.error("Mermaid render error:", error);
  },
  onRendered: ({ container, code }) => {
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
    const hint = container.querySelector("[data-mermaid-hint]");
    const zoomLevel = container.querySelector("[data-mermaid-zoom-level]");
    if (!viewport || !panLayer) return;

    const controls = setupPanZoom(viewport, panLayer, {
      maxScale: 8,
      zoomLevelEl: zoomLevel,
      hintEl: hint as HTMLElement | null,
      hintMode: "fade",
      setTransformOrigin: false,
      grabCursor: false,
      fit: {
        padding: 40,
        cap: Number.POSITIVE_INFINITY,
        fallback: "none",
        content: "svg-viewbox",
      },
    });
    requestAnimationFrame(() => controls.fitToViewport());

    container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
    container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
    container
      .querySelector("[data-mermaid-zoom-reset]")
      ?.addEventListener("click", controls.fitToViewport);

    const copyBtn = container.querySelector("[data-mermaid-copy]");
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add("is-copied");
        setTimeout(() => copyBtn.classList.remove("is-copied"), 1500);
      } catch {}
    });
  },
  onReRenderError: (error) => console.error("Mermaid re-render error:", error),
  theme: { onlyOnDarkChange: true, reconnect: true },
  startup: "ready",
});
