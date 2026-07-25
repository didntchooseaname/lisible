import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

type MermaidApi = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidApi> | null = null;
let renderQueue: Promise<void> = Promise.resolve();

function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

function decode(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function accentColor(): string | undefined {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return /^(rgb|hsl|#)/.test(raw) ? raw : undefined;
}

async function initMermaid(): Promise<MermaidApi> {
  const mermaid = await loadMermaid();
  const accent = accentColor();
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark() ? "dark" : "default",
    fontFamily: "var(--font-sans)",
    securityLevel: "strict",
    themeVariables: accent ? { lineColor: accent, primaryBorderColor: accent } : {},
  });
  return mermaid;
}

function prepareSvg(svg: SVGSVGElement) {
  const viewBox = svg.viewBox.baseVal;
  if (viewBox?.width && viewBox?.height) {
    svg.setAttribute("width", `${viewBox.width}`);
    svg.setAttribute("height", `${viewBox.height}`);
  }
  svg.style.display = "block";
  svg.style.maxWidth = "none";
  svg.style.maxHeight = "none";
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

async function renderEmbed(embed: HTMLElement) {
  const render = embed.querySelector<HTMLElement>("[data-mermaid-render]");
  const fallback = embed.querySelector<HTMLElement>("[data-mermaid-fallback]");
  if (!render) return;
  const encoded = embed.dataset.mermaidSrc ?? "";
  const code = decode(encoded);
  if (!code) return;

  try {
    const mermaid = await initMermaid();
    const id = `mmd-${Math.random().toString(36).slice(2, 9)}`;
    const { svg } = await mermaid.render(id, code);
    render.innerHTML = svg;
    const svgEl = render.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);
    if (fallback) fallback.hidden = true;
    const chrome = buildChrome(embed, render);
    requestAnimationFrame(() => {
      (chrome.viewport as HTMLElement & { __mzControls?: Controls }).__mzControls?.fit();
    });
  } catch (err) {
    console.error("Mermaid render error:", err);
    if (fallback) {
      fallback.hidden = false;
      fallback.classList.add("mermaid-fallback-error");
      const label = embed.dataset.labelError;
      if (label) fallback.setAttribute("data-error", label);
    }
  }
}

async function reRenderEmbed(embed: HTMLElement) {
  const render = embed.querySelector<HTMLElement>("[data-mermaid-render]");
  if (!render) return;
  const encoded = embed.dataset.mermaidSrc ?? "";
  const code = decode(encoded);
  if (!code) return;
  try {
    const mermaid = await initMermaid();
    const id = `mmd-${Math.random().toString(36).slice(2, 9)}`;
    const { svg } = await mermaid.render(id, code);
    render.innerHTML = svg;
    const svgEl = render.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);
    const viewport = embed.querySelector<HTMLElement>(".mermaid-viewport");
    (viewport as HTMLElement & { __mzControls?: Controls })?.__mzControls?.fit();
  } catch (err) {
    console.error("Mermaid re-render error:", err);
  }
}

function queue(embed: HTMLElement) {
  if (embed.hasAttribute("data-mermaid-done")) return;
  embed.setAttribute("data-mermaid-done", "");
  renderQueue = renderQueue.then(() => renderEmbed(embed));
}

function observe(embed: HTMLElement) {
  if (embed.hasAttribute("data-mermaid-done") || embed.hasAttribute("data-mermaid-observed"))
    return;
  if (!("IntersectionObserver" in window)) {
    queue(embed);
    return;
  }
  embed.setAttribute("data-mermaid-observed", "");
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      embed.removeAttribute("data-mermaid-observed");
      queue(embed);
    },
    { rootMargin: "300px 0px" },
  );
  io.observe(embed);
}

function renderAll() {
  document.querySelectorAll<HTMLElement>("[data-mermaid]").forEach((embed) => {
    if (!embed.hasAttribute("data-mermaid-done")) {
      const fallback = embed.querySelector<HTMLElement>("[data-mermaid-fallback]");
      if (fallback) fallback.hidden = true;
    }
    observe(embed);
  });
}

let themeTimer: number | null = null;
function scheduleReRender() {
  if (themeTimer !== null) window.clearTimeout(themeTimer);
  themeTimer = window.setTimeout(() => {
    themeTimer = null;
    document
      .querySelectorAll<HTMLElement>("[data-mermaid][data-mermaid-done]")
      .forEach((embed) => reRenderEmbed(embed));
  }, 60);
}

renderAll();
document.addEventListener("astro:page-load", renderAll);

const themeObserver = new MutationObserver(scheduleReRender);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class", "style"],
});
