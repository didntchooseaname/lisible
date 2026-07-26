import { createMermaidClient } from "../../../../shared/scripts/mermaid";
import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function accentColor(): string | undefined {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return /^(rgb|hsl|#)/.test(raw) ? raw : undefined;
}

interface Controls {
  fit: () => void;
}

function iconButton(label: string, path: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mermaid-btn";
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  return btn;
}

function buildChrome(embed: HTMLElement, render: HTMLElement) {
  const labelDiagram = embed.dataset.labelDiagram ?? "Diagram";
  const labelIn = embed.dataset.labelZoomin ?? "Zoom in";
  const labelOut = embed.dataset.labelZoomout ?? "Zoom out";
  const labelReset = embed.dataset.labelReset ?? "Reset view";

  const toolbar = document.createElement("div");
  toolbar.className = "mermaid-toolbar";

  const title = document.createElement("span");
  title.className = "mermaid-label";
  title.textContent = labelDiagram;

  const controls = document.createElement("div");
  controls.className = "mermaid-controls";
  const zoomLevel = document.createElement("span");
  zoomLevel.className = "mermaid-zoom-level";
  zoomLevel.textContent = "100%";

  const outBtn = iconButton(
    labelOut,
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>',
  );
  const resetBtn = iconButton(
    labelReset,
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  );
  const inBtn = iconButton(
    labelIn,
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  );

  controls.append(outBtn, zoomLevel, inBtn, resetBtn);
  toolbar.append(title, controls);

  const viewport = document.createElement("div");
  viewport.className = "mermaid-viewport";
  viewport.style.cursor = "grab";
  render.parentElement?.insertBefore(viewport, render);
  viewport.appendChild(render);

  embed.insertBefore(toolbar, embed.firstChild);

  const engine = setupPanZoom(viewport, render, {
    zoomLevelEl: zoomLevel,
    grabCursor: false,
    fit: {
      padding: 32,
      cap: Number.POSITIVE_INFINITY,
      fallback: "reset",
      content: "svg-viewbox",
    },
  });
  const pz: Controls & { zoomIn: () => void; zoomOut: () => void } = {
    fit: engine.fitToViewport,
    zoomIn: engine.zoomIn,
    zoomOut: engine.zoomOut,
  };
  (viewport as HTMLElement & { __mzControls?: typeof pz }).__mzControls = pz;
  inBtn.addEventListener("click", () => pz.zoomIn());
  outBtn.addEventListener("click", () => pz.zoomOut());
  resetBtn.addEventListener("click", () => pz.fit());
  return { viewport, zoomLevel };
}

createMermaidClient({
  load: () => import("mermaid").then((m) => m.default),
  selector: "[data-mermaid]",
  renderedAttr: "data-mermaid-done",
  source: (embed) => embed.dataset.mermaidSrc ?? "",
  config: () => {
    const accent = accentColor();
    return {
      theme: isDark() ? "dark" : "default",
      fontFamily: "var(--font-sans)",
      securityLevel: "strict",
      themeVariables: accent ? { lineColor: accent, primaryBorderColor: accent } : {},
    };
  },
  diagramId: () => `mmd-${Math.random().toString(36).slice(2, 9)}`,
  beforeObserve: (embed) => {
    if (!embed.hasAttribute("data-mermaid-done")) {
      const fallback = embed.querySelector<HTMLElement>("[data-mermaid-fallback]");
      if (fallback) fallback.hidden = true;
    }
  },
  onSuccess: ({ container, renderTarget }) => {
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) fallback.hidden = true;
    const chrome = buildChrome(container, renderTarget);
    requestAnimationFrame(() => {
      (chrome.viewport as HTMLElement & { __mzControls?: Controls }).__mzControls?.fit();
    });
  },
  onError: (container, error) => {
    console.error("Mermaid render error:", error);
    const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
    if (fallback) {
      fallback.hidden = false;
      fallback.classList.add("mermaid-fallback-error");
      const label = container.dataset.labelError;
      if (label) fallback.setAttribute("data-error", label);
    }
  },
  onReRendered: (container) => {
    const viewport = container.querySelector<HTMLElement>(".mermaid-viewport");
    (viewport as (HTMLElement & { __mzControls?: Controls }) | null)?.__mzControls?.fit();
  },
  onReRenderError: (error) => console.error("Mermaid re-render error:", error),
  theme: { debounce: 60, attributeFilter: ["class", "style"] },
  startup: "eager",
});
