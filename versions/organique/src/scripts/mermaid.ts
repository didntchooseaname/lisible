import { createMermaidClient } from "../../../../shared/scripts/mermaid";
import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

let normCtx: CanvasRenderingContext2D | null = null;
function normalizeColor(color: string): string {
  if (!normCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    normCtx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!normCtx) return color;
  normCtx.clearRect(0, 0, 1, 1);
  normCtx.fillStyle = color;
  normCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = normCtx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r} ${g} ${b})`;
}

function readToken(probe: HTMLElement, value: string): string {
  probe.style.color = value;
  return normalizeColor(getComputedStyle(probe).color);
}

function themeConfig() {
  const isDark = document.documentElement.classList.contains("dark");
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const card = readToken(probe, "var(--color-card)");
  const fg = readToken(probe, "var(--color-foreground)");
  const border = readToken(probe, "var(--color-border)");
  const muted = readToken(probe, "var(--color-muted-foreground)");
  const secondary = readToken(probe, "var(--color-secondary)");
  const accent = readToken(probe, "var(--accent)");
  const bg = readToken(probe, "var(--color-background)");
  probe.remove();
  return {
    theme: isDark ? "dark" : "default",
    themeVariables: {
      background: bg,
      primaryColor: secondary,
      primaryTextColor: fg,
      primaryBorderColor: border,
      lineColor: muted,
      secondaryColor: secondary,
      tertiaryColor: card,
      mainBkg: secondary,
      nodeBorder: border,
      clusterBkg: card,
      clusterBorder: border,
      titleColor: fg,
      edgeLabelBackground: bg,
      noteBkgColor: card,
      noteTextColor: fg,
      noteBorderColor: border,
      actorBorder: accent,
    },
  } as const;
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid]",
  config: () => {
    const cfg = themeConfig();
    return {
      theme: cfg.theme,
      fontFamily: "var(--font-sans)",
      securityLevel: "loose",
      themeVariables: cfg.themeVariables as Record<string, string>,
    };
  },
  diagramId: (container) => container.id,
  onError: (container) => {
    container.classList.add("diagram-error");
    const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
    if (sourceEl) sourceEl.hidden = false;
  },
  onRendered: ({ container, code }) => {
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    const pan = container.querySelector<HTMLElement>("[data-mermaid-pan]");
    const level = container.querySelector<HTMLElement>("[data-mermaid-zoom-level]");
    const hint = container.querySelector<HTMLElement>("[data-mermaid-hint]");
    if (viewport && pan) {
      const controls = setupPanZoom(viewport, pan, {
        maxScale: 8,
        zoomLevelEl: level,
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

      container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
      container
        .querySelector("[data-mermaid-zoom-out]")
        ?.addEventListener("click", controls.zoomOut);
      container
        .querySelector("[data-mermaid-reset]")
        ?.addEventListener("click", controls.fitToViewport);

      requestAnimationFrame(controls.fitToViewport);
    }

    const copyBtn = container.querySelector<HTMLElement>("[data-mermaid-copy]");
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add("is-copied");
        window.setTimeout(() => copyBtn.classList.remove("is-copied"), 1400);
      } catch {}
    });
  },
  theme: { debounce: 120, attributeFilter: ["class", "style"] },
  startup: "pageload",
});
