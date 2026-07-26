import { createMermaidClient } from "../../../../shared/scripts/mermaid";

const probe = document.createElement("canvas").getContext("2d", {
  willReadFrequently: true,
});

function token(name: string, fallback: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw || !probe) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = fallback;
  try {
    probe.fillStyle = raw;
  } catch {}
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function themeVariables() {
  const card = token("--card", "#161616");
  const foreground = token("--foreground", "#fafafa");
  const border = token("--border", "#333333");
  const muted = token("--muted", "#222222");
  const mutedFg = token("--muted-foreground", "#aaaaaa");
  const background = token("--background", "#000000");
  return {
    background,
    primaryColor: card,
    primaryTextColor: foreground,
    primaryBorderColor: border,
    secondaryColor: muted,
    tertiaryColor: muted,
    mainBkg: card,
    nodeBorder: border,
    lineColor: mutedFg,
    textColor: foreground,
    titleColor: foreground,
    noteBkgColor: muted,
    noteTextColor: foreground,
    noteBorderColor: border,
    clusterBkg: muted,
    clusterBorder: border,
    edgeLabelBackground: card,
  };
}

function setupPanZoom(viewport: HTMLElement, panLayer: HTMLElement, zoomLevelEl?: Element | null) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;

  function apply() {
    panLayer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    panLayer.style.transformOrigin = "center center";
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }
  function zoomIn() {
    scale = Math.min(scale * 1.25, 20);
    apply();
  }
  function zoomOut() {
    scale = Math.max(scale / 1.25, 0.2);
    apply();
  }
  function fit() {
    const svg = panLayer.querySelector<SVGSVGElement>("svg");
    const vb = svg?.viewBox.baseVal;
    const rect = viewport.getBoundingClientRect();
    if (!vb?.width || !vb?.height || !rect.width || !rect.height) {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
      return;
    }
    scale = Math.min((rect.width - 48) / vb.width, (rect.height - 48) / vb.height);
    scale = Math.min(Math.max(scale, 0.2), 20);
    tx = 0;
    ty = 0;
    apply();
  }

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale = e.deltaY < 0 ? Math.min(scale * 1.1, 20) : Math.max(scale / 1.1, 0.2);
      apply();
    },
    { passive: false },
  );
  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    panning = true;
    startX = e.clientX - tx;
    startY = e.clientY - ty;
    viewport.style.cursor = "grabbing";
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    tx = e.clientX - startX;
    ty = e.clientY - startY;
    apply();
  });
  viewport.addEventListener("pointerup", () => {
    panning = false;
    viewport.style.cursor = "grab";
  });

  return { zoomIn, zoomOut, fit };
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid]",
  requires: ["[data-mermaid-viewport]", "[data-mermaid-pan]"],
  config: () => ({
    theme: "base",
    fontFamily: "var(--font-sans)",
    securityLevel: "loose",
    themeVariables: themeVariables(),
  }),
  diagramId: (container) => container.id,
  onError: (container, error) => {
    const fallback = container.querySelector<HTMLElement>(".mermaid-fallback");
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    if (fallback) fallback.hidden = false;
    if (viewport) viewport.style.display = "none";
    console.error("Mermaid render error:", error);
  },
  onRendered: ({ container, code }) => {
    const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
    const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
    const zoomLevel = container.querySelector("[data-mermaid-zoom-level]");
    if (!viewport || !panLayer) return;

    const controls = setupPanZoom(viewport, panLayer, zoomLevel);
    requestAnimationFrame(() => controls.fit());

    container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
    container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
    container.querySelector("[data-mermaid-reset]")?.addEventListener("click", controls.fit);

    const copyBtn = container.querySelector("[data-mermaid-copy]");
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
      } catch {}
    });
  },
  onReRenderError: (error) => console.error("Mermaid re-render error:", error),
  startup: "eager",
});
