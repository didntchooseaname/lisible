import { createMermaidClient } from "../../../../shared/scripts/mermaid";
import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

let convertCtx: CanvasRenderingContext2D | null = null;

function toRgb(color: string): string {
  if (!color || color.startsWith("rgb")) return color;
  convertCtx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const ctx = convertCtx;
  if (!ctx) return color;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

function tokenColor(probe: HTMLElement, token: string): string {
  probe.style.color = `var(${token})`;
  return toRgb(getComputedStyle(probe).color);
}

function readThemeVariables() {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const c = (token: string) => tokenColor(probe, token);
  const vars = {
    background: c("--color-card"),
    mainBkg: c("--color-secondary"),
    primaryColor: c("--color-secondary"),
    primaryTextColor: c("--color-foreground"),
    primaryBorderColor: c("--color-muted-foreground"),
    secondaryColor: c("--color-muted"),
    tertiaryColor: c("--color-card"),
    lineColor: c("--color-muted-foreground"),
    textColor: c("--color-foreground"),
    nodeBorder: c("--color-muted-foreground"),
    clusterBkg: c("--color-card"),
    clusterBorder: c("--color-border"),
    noteBkgColor: c("--color-secondary"),
    noteTextColor: c("--color-foreground"),
    noteBorderColor: c("--color-border"),
    titleColor: c("--color-foreground"),
    edgeLabelBackground: c("--color-card"),
  };
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim();
  probe.remove();
  return { vars, fontFamily };
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid]",
  requires: ["[data-mermaid-viewport]", "[data-mermaid-pan]"],
  config: () => {
    const { vars, fontFamily } = readThemeVariables();
    return {
      theme: "base",
      securityLevel: "loose",
      fontFamily: fontFamily || "sans-serif",
      themeVariables: vars,
    };
  },
  diagramId: (container) =>
    container.dataset.mermaidId ||
    (container.dataset.mermaidId = `m${Math.random().toString(36).slice(2, 9)}`),
  onError: (container, error) => {
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) fallback.hidden = false;
    console.error("Mermaid render error:", error);
  },
  onRendered: ({ container, code }) => {
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
    const levelEl = container.querySelector("[data-mermaid-zoom-level]");
    if (!viewport || !panLayer) return;

    const controls = setupPanZoom(viewport, panLayer, {
      zoomLevelEl: levelEl,
      grabCursor: false,
      fit: {
        padding: 32,
        cap: Number.POSITIVE_INFINITY,
        clampMax: 4,
        fallback: "reset",
        content: "svg-viewbox",
      },
    });
    requestAnimationFrame(() => controls.fitToViewport());
    viewport.style.cursor = "grab";

    container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
    container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
    container
      .querySelector("[data-mermaid-zoom-reset]")
      ?.addEventListener("click", controls.fitToViewport);

    const copyBtn = container.querySelector<HTMLElement>("[data-mermaid-copy]");
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add("is-copied");
        setTimeout(() => copyBtn.classList.remove("is-copied"), 1500);
      } catch {}
    });
  },
  onReRenderError: (error) => console.error("Mermaid re-render error:", error),
  theme: { debounce: 60 },
  startup: "eager",
});
