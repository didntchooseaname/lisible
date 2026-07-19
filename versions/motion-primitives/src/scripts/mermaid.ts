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

async function initMermaid(): Promise<MermaidApi> {
  const mermaid = await loadMermaid();
  const dark = isDark();
  mermaid.initialize({
    startOnLoad: false,
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
  });
  return mermaid;
}

function prepareSvg(svg: SVGSVGElement) {
  const box = svg.viewBox.baseVal;
  if (box?.width && box?.height) {
    svg.setAttribute("width", `${box.width}`);
    svg.setAttribute("height", `${box.height}`);
  }
  svg.style.display = "block";
  svg.style.maxWidth = "none";
  svg.style.maxHeight = "none";
}

function setupPanZoom(
  viewport: HTMLElement,
  pan: HTMLElement,
  levelEl: Element | null,
  hintEl: Element | null,
) {
  let scale = 1;
  let x = 0;
  let y = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;
  let hintHidden = false;

  const hideHint = () => {
    if (!hintHidden && hintEl) {
      (hintEl as HTMLElement).style.opacity = "0";
      hintHidden = true;
    }
  };
  const level = () => {
    if (levelEl) levelEl.textContent = `${Math.round(scale * 100)}%`;
  };
  const applyTransform = () => {
    pan.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    pan.style.transformOrigin = "center center";
    level();
  };
  const zoomIn = () => {
    scale = Math.min(scale * 1.25, 20);
    applyTransform();
    hideHint();
  };
  const zoomOut = () => {
    scale = Math.max(scale / 1.25, 0.2);
    applyTransform();
    hideHint();
  };
  const fit = () => {
    const svg = pan.querySelector<SVGSVGElement>("svg");
    const box = svg?.viewBox.baseVal;
    const rect = viewport.getBoundingClientRect();
    if (!box?.width || !box?.height || !rect.width || !rect.height) {
      scale = 1;
      x = 0;
      y = 0;
      applyTransform();
      return;
    }
    const pad = 40;
    scale = Math.min(
      Math.max((rect.width - pad) / box.width, 0.2),
      Math.max((rect.height - pad) / box.height, 0.2),
      20,
    );
    x = 0;
    y = 0;
    applyTransform();
  };

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.deltaY < 0) scale = Math.min(scale * 1.1, 20);
      else scale = Math.max(scale / 1.1, 0.2);
      applyTransform();
      hideHint();
    },
    { passive: false },
  );
  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    panning = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
    viewport.style.cursor = "grabbing";
    viewport.setPointerCapture(e.pointerId);
    hideHint();
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    applyTransform();
  });
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  return { zoomIn, zoomOut, fit };
}

async function renderDiagram(container: HTMLElement) {
  const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
  const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
  const loading = container.querySelector<HTMLElement>("[data-mermaid-loading]");
  const fallback = container.querySelector<HTMLElement>("[data-mermaid-fallback]");
  const viewport = container.querySelector<HTMLElement>("[data-mermaid-viewport]");
  const pan = container.querySelector<HTMLElement>("[data-mermaid-pan]");
  const hint = container.querySelector<HTMLElement>("[data-mermaid-hint]");
  const levelEl = container.querySelector("[data-mermaid-zoom-level]");
  if (!sourceEl || !renderTarget || !viewport || !pan) return;

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
    if (fallback) fallback.hidden = true;
  } catch (err) {
    if (loading) loading.style.display = "none";
    if (fallback) fallback.hidden = false;
    console.error("Mermaid render error:", err);
    return;
  }

  const controls = setupPanZoom(viewport, pan, levelEl, hint);
  requestAnimationFrame(() => controls.fit());
  container.querySelector("[data-mermaid-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-mermaid-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-mermaid-zoom-reset]")?.addEventListener("click", controls.fit);

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

function observe(container: HTMLElement) {
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
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      container.removeAttribute("data-mermaid-observed");
      queueRender(container);
    },
    { rootMargin: "300px 0px" },
  );
  io.observe(container);
}

function renderAll() {
  document
    .querySelectorAll<HTMLElement>("[data-mermaid-container]")
    .forEach((c) => observe(c));
}

async function reRenderAll() {
  const containers = document.querySelectorAll<HTMLElement>("[data-mermaid-container]");
  for (const container of containers) {
    const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
    const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
    if (!container.hasAttribute("data-mermaid-rendered") || !renderTarget || !sourceEl) continue;
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
  themeObserver = new MutationObserver(() => reRenderAll());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

document.addEventListener("astro:page-load", start);
