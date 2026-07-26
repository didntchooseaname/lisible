import { createMermaidClient } from "../../../../shared/scripts/mermaid";
import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid-container]",
  requires: ["[data-mermaid-viewport]", "[data-mermaid-pan]"],
  config: () => {
    const dark = isDark();
    return {
      theme: dark ? "dark" : "default",
      fontFamily: "var(--font-sans)",
      securityLevel: "loose",
      themeVariables: dark
        ? {
            primaryColor: "#1f1f1f",
            primaryTextColor: "#fafafa",
            primaryBorderColor: "#333333",
            lineColor: "#888888",
            secondaryColor: "#1f1f1f",
            tertiaryColor: "#1f1f1f",
            background: "#000000",
            mainBkg: "#1f1f1f",
            nodeBorder: "#333333",
            clusterBkg: "#141414",
            clusterBorder: "#333333",
            titleColor: "#fafafa",
            edgeLabelBackground: "#141414",
          }
        : {
            primaryColor: "#f4f4f4",
            primaryTextColor: "#171717",
            primaryBorderColor: "#e5e5e5",
            lineColor: "#888888",
            secondaryColor: "#f4f4f4",
            tertiaryColor: "#f4f4f4",
            background: "#ffffff",
            mainBkg: "#f4f4f4",
            nodeBorder: "#e5e5e5",
            clusterBkg: "#fafafa",
            clusterBorder: "#e5e5e5",
            titleColor: "#171717",
            edgeLabelBackground: "#ffffff",
          },
    };
  },
  diagramId: (container) => container.id,
  onSuccess: ({ container }) => {
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) fallback.hidden = true;
  },
  onError: (container, error) => {
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) fallback.hidden = false;
    console.error("Mermaid render error:", error);
  },
  onRendered: ({ container, code }) => {
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    const pan = container.querySelector<HTMLElement>("[data-mermaid-pan]");
    const hint = container.querySelector<HTMLElement>("[data-mermaid-hint]");
    const levelEl = container.querySelector("[data-mermaid-zoom-level]");
    if (!viewport || !pan) return;

    const controls = setupPanZoom(viewport, pan, {
      zoomLevelEl: levelEl,
      hintEl: hint,
      hintMode: "fade",
      grabCursor: false,
      fit: {
        padding: 40,
        cap: Number.POSITIVE_INFINITY,
        fallback: "reset",
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
  theme: { reconnect: true },
  startup: "pageload",
});
