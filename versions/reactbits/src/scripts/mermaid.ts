import { resolveRgb } from "@/lib/kit";

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

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

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

function prepareSvg(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  if (vb?.width && vb?.height) {
    svg.setAttribute("width", `${vb.width}`);
    svg.setAttribute("height", `${vb.height}`);
  }
  svg.style.display = "block";
  svg.style.maxWidth = "none";
  svg.style.maxHeight = "none";
}

function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  zoomLevelEl: Element | null,
  hintEl: Element | null,
) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;
  let hintHidden = false;

  function hideHint() {
    if (!hintHidden && hintEl) {
      (hintEl as HTMLElement).style.opacity = "0";
      hintHidden = true;
    }
  }
  function display() {
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }
  function apply() {
    panLayer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    display();
  }
  function fit() {
    const svg = panLayer.querySelector<SVGSVGElement>("svg");
    const vb = svg?.viewBox.baseVal;
    const rect = viewport.getBoundingClientRect();
    if (!vb?.width || !vb?.height || !rect.width || !rect.height) return;
    const pad = 40;
    scale = Math.min(
      (rect.width - pad) / vb.width,
      (rect.height - pad) / vb.height,
    );
    scale = Math.min(Math.max(scale, 0.2), 8);
    tx = 0;
    ty = 0;
    apply();
  }

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale =
        e.deltaY < 0
          ? Math.min(scale * 1.1, 8)
          : Math.max(scale / 1.1, 0.2);
      apply();
      hideHint();
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
    hideHint();
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    tx = e.clientX - startX;
    ty = e.clientY - startY;
    apply();
  });
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  return {
    zoomIn: () => {
      scale = Math.min(scale * 1.25, 8);
      apply();
      hideHint();
    },
    zoomOut: () => {
      scale = Math.max(scale / 1.25, 0.2);
      apply();
      hideHint();
    },
    fit,
  };
}

async function renderDiagram(container: HTMLElement) {
  const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
  const renderTarget = container.querySelector<HTMLElement>(
    "[data-mermaid-render]",
  );
  const loading = container.querySelector<HTMLElement>("[data-mermaid-loading]");
  const fallback = container.querySelector<HTMLElement>(
    "[data-mermaid-fallback]",
  );
  const viewport = container.querySelector<HTMLElement>(
    "[data-mermaid-viewport]",
  );
  const panLayer = container.querySelector<HTMLElement>("[data-mermaid-pan]");
  const hint = container.querySelector("[data-mermaid-hint]");
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
    console.error("Mermaid render error:", err);
    return;
  }

  const controls = setupPanZoom(viewport, panLayer, zoomLevel, hint);
  requestAnimationFrame(() => controls.fit());

  container
    .querySelector("[data-mermaid-zoom-in]")
    ?.addEventListener("click", controls.zoomIn);
  container
    .querySelector("[data-mermaid-zoom-out]")
    ?.addEventListener("click", controls.zoomOut);
  container
    .querySelector("[data-mermaid-zoom-reset]")
    ?.addEventListener("click", controls.fit);

  const copyBtn = container.querySelector("[data-mermaid-copy]");
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
    .querySelectorAll<HTMLElement>("[data-mermaid-container]")
    .forEach((c) => renderWhenVisible(c));
}

async function reRenderAll() {
  const containers = document.querySelectorAll<HTMLElement>(
    "[data-mermaid-container][data-mermaid-rendered]",
  );
  for (const container of containers) {
    const renderTarget = container.querySelector<HTMLElement>(
      "[data-mermaid-render]",
    );
    const sourceEl = container.querySelector<HTMLElement>(
      "[data-mermaid-source]",
    );
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

let themeObserver: MutationObserver | null = null;

function start() {
  renderAll();
  themeObserver?.disconnect();
  let lastDark = isDark();
  themeObserver = new MutationObserver(() => {
    if (isDark() === lastDark) return;
    lastDark = isDark();
    void reRenderAll();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

document.addEventListener("astro:page-load", start);
if (document.readyState !== "loading") start();
