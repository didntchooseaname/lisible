type MermaidApi = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidApi> | null = null;
let renderQueue = Promise.resolve();

function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

function decode(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

let convertCtx: CanvasRenderingContext2D | null = null;

function toRgb(color: string): string {
  if (!color || color.startsWith("rgb")) return color;
  convertCtx ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  const ctx = convertCtx;
  if (!ctx) return color;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
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
  const fontFamily = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
  probe.remove();
  return { vars, fontFamily };
}

async function initMermaid(): Promise<MermaidApi> {
  const mermaid = await loadMermaid();
  const { vars, fontFamily } = readThemeVariables();
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: fontFamily || "sans-serif",
    themeVariables: vars,
  });
  return mermaid;
}

function prepareSvg(svgEl: SVGSVGElement) {
  const viewBox = svgEl.viewBox.baseVal;
  if (viewBox?.width && viewBox?.height) {
    svgEl.setAttribute("width", `${viewBox.width}`);
    svgEl.setAttribute("height", `${viewBox.height}`);
  }
  svgEl.style.display = "block";
  svgEl.style.maxWidth = "none";
  svgEl.style.maxHeight = "none";
}

interface PanZoom {
  fit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  levelEl: Element | null,
): PanZoom {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;

  function apply() {
    panLayer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    panLayer.style.transformOrigin = "center center";
    if (levelEl) levelEl.textContent = `${Math.round(scale * 100)}%`;
  }

  function fit() {
    const svg = panLayer.querySelector<SVGSVGElement>("svg");
    const box = svg?.viewBox.baseVal;
    const rect = viewport.getBoundingClientRect();
    if (!box?.width || !box?.height || !rect.width || !rect.height) {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
      return;
    }
    const pad = 32;
    scale = Math.min((rect.width - pad) / box.width, (rect.height - pad) / box.height);
    scale = Math.min(Math.max(scale, 0.2), 4);
    tx = 0;
    ty = 0;
    apply();
  }

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      scale = event.deltaY < 0 ? Math.min(scale * 1.1, 20) : Math.max(scale / 1.1, 0.2);
      apply();
    },
    { passive: false },
  );
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    panning = true;
    startX = event.clientX - tx;
    startY = event.clientY - ty;
    viewport.style.cursor = "grabbing";
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!panning) return;
    tx = event.clientX - startX;
    ty = event.clientY - startY;
    apply();
  });
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  return {
    fit,
    zoomIn: () => {
      scale = Math.min(scale * 1.25, 20);
      apply();
    },
    zoomOut: () => {
      scale = Math.max(scale / 1.25, 0.2);
      apply();
    },
  };
}

async function renderContainer(container: HTMLElement) {
  const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
  const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
  const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
  const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
  const loading = container.querySelector<HTMLElement>("[data-mermaid-loading]");
  const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
  const levelEl = container.querySelector("[data-mermaid-zoom-level]");
  if (!sourceEl || !renderTarget || !viewport || !panLayer) return;

  const code = decode(sourceEl.getAttribute("data-mermaid-source") || "");
  if (!code) return;

  try {
    const mermaid = await initMermaid();
    const svgId = `${container.dataset.mermaidId || (container.dataset.mermaidId = `m${Math.random().toString(36).slice(2, 9)}`)}-svg`;
    document.getElementById(svgId)?.remove();
    const { svg } = await mermaid.render(svgId, code);
    renderTarget.innerHTML = svg;
    const svgEl = renderTarget.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);
    if (loading) loading.style.display = "none";
  } catch (error) {
    if (loading) loading.style.display = "none";
    if (fallback) fallback.hidden = false;
    console.error("Mermaid render error:", error);
    return;
  }

  const controls = setupPanZoom(viewport, panLayer, levelEl);
  requestAnimationFrame(() => controls.fit());
  viewport.style.cursor = "grab";

  container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-mermaid-zoom-reset]")?.addEventListener("click", controls.fit);

  const copyBtn = container.querySelector<HTMLElement>("[data-mermaid-copy]");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.classList.add("is-copied");
      setTimeout(() => copyBtn.classList.remove("is-copied"), 1500);
    } catch {
    }
  });
}

function queueRender(container: HTMLElement) {
  if (container.hasAttribute("data-mermaid-rendered")) return;
  container.setAttribute("data-mermaid-rendered", "");
  renderQueue = renderQueue.then(() => renderContainer(container));
}

function observe(container: HTMLElement) {
  if (container.hasAttribute("data-mermaid-rendered") || container.hasAttribute("data-mermaid-observed")) return;
  if (!("IntersectionObserver" in window)) {
    queueRender(container);
    return;
  }
  container.setAttribute("data-mermaid-observed", "");
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      container.removeAttribute("data-mermaid-observed");
      queueRender(container);
    },
    { rootMargin: "300px 0px" },
  );
  observer.observe(container);
}

function renderAll() {
  document.querySelectorAll<HTMLElement>("[data-mermaid]").forEach(observe);
}

async function reRenderForTheme() {
  const containers = document.querySelectorAll<HTMLElement>("[data-mermaid][data-mermaid-rendered]");
  for (const container of containers) {
    const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
    const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
    if (!renderTarget || !sourceEl) continue;
    const code = decode(sourceEl.getAttribute("data-mermaid-source") || "");
    if (!code) continue;
    try {
      const mermaid = await initMermaid();
      const svgId = `${container.dataset.mermaidId}-svg`;
      document.getElementById(svgId)?.remove();
      const { svg } = await mermaid.render(svgId, code);
      renderTarget.innerHTML = svg;
      const svgEl = renderTarget.querySelector<SVGSVGElement>("svg");
      if (svgEl) prepareSvg(svgEl);
    } catch (error) {
      console.error("Mermaid re-render error:", error);
    }
  }
}

renderAll();
document.addEventListener("astro:page-load", renderAll);

let themeTimer: number | null = null;
const themeObserver = new MutationObserver(() => {
  if (themeTimer !== null) window.clearTimeout(themeTimer);
  themeTimer = window.setTimeout(() => {
    themeTimer = null;
    void reRenderForTheme();
  }, 60);
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
