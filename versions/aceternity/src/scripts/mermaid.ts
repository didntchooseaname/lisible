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
  } catch {
  }
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

async function initMermaid(): Promise<MermaidApi> {
  const mermaid = await loadMermaid();
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    fontFamily: "var(--font-sans)",
    securityLevel: "loose",
    themeVariables: themeVariables(),
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

function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  zoomLevelEl?: Element | null,
) {
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

async function renderDiagram(container: HTMLElement) {
  const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
  const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
  const loading = container.querySelector<HTMLElement>("[data-mermaid-loading]");
  const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
  const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
  const fallback = container.querySelector<HTMLElement>(".mermaid-fallback");
  const zoomLevel = container.querySelector("[data-mermaid-zoom-level]");
  if (!sourceEl || !renderTarget || !viewport || !panLayer) return;

  const code = decode(sourceEl.getAttribute("data-mermaid-source") || "");
  if (!code) return;

  try {
    const mermaid = await initMermaid();
    const svgId = `${container.id}-svg`;
    document.getElementById(svgId)?.remove();
    const { svg } = await mermaid.render(svgId, code);
    renderTarget.innerHTML = svg;
    const svgEl = renderTarget.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);
    if (loading) loading.style.display = "none";
  } catch (err) {
    if (loading) loading.style.display = "none";
    if (fallback) fallback.hidden = false;
    viewport.style.display = "none";
    console.error("Mermaid render error:", err);
    return;
  }

  const controls = setupPanZoom(viewport, panLayer, zoomLevel);
  requestAnimationFrame(() => controls.fit());

  container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-mermaid-reset]")?.addEventListener("click", controls.fit);

  const copyBtn = container.querySelector("[data-mermaid-copy]");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
    }
  });
}

function queueRender(container: HTMLElement) {
  if (container.hasAttribute("data-mermaid-rendered")) return;
  container.setAttribute("data-mermaid-rendered", "");
  renderQueue = renderQueue.then(() => renderDiagram(container));
}

function renderWhenVisible(container: HTMLElement) {
  if (
    container.hasAttribute("data-mermaid-rendered") ||
    container.hasAttribute("data-mermaid-observed")
  )
    return;
  if (!("IntersectionObserver" in window)) {
    queueRender(container);
    return;
  }
  container.setAttribute("data-mermaid-observed", "");
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      container.removeAttribute("data-mermaid-observed");
      queueRender(container);
    },
    { rootMargin: "300px 0px" },
  );
  observer.observe(container);
}

function renderAll() {
  document
    .querySelectorAll<HTMLElement>("[data-mermaid]")
    .forEach((container) => renderWhenVisible(container));
}

async function reRenderAll() {
  const containers = document.querySelectorAll<HTMLElement>("[data-mermaid][data-mermaid-rendered]");
  for (const container of containers) {
    const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
    const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
    if (!renderTarget || !sourceEl) continue;
    const code = decode(sourceEl.getAttribute("data-mermaid-source") || "");
    if (!code) continue;
    try {
      const mermaid = await initMermaid();
      const svgId = `${container.id}-svg`;
      document.getElementById(svgId)?.remove();
      const { svg } = await mermaid.render(svgId, code);
      renderTarget.innerHTML = svg;
      const svgEl = renderTarget.querySelector<SVGSVGElement>("svg");
      if (svgEl) prepareSvg(svgEl);
    } catch (err) {
      console.error("Mermaid re-render error:", err);
    }
  }
}

renderAll();
document.addEventListener("astro:page-load", renderAll);

const themeObserver = new MutationObserver(() => reRenderAll());
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
