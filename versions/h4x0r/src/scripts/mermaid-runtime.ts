import { bindDiagramControls, prepareSvg, setupPanZoom, type PanZoomControls } from "@/lib/pan-zoom";

type MermaidApi = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidApi> | null = null;
let renderQueue: Promise<void> = Promise.resolve();
let renderedTheme: boolean | null = null;
let idCounter = 0;

const controlsByBlock = new WeakMap<HTMLElement, PanZoomControls>();

function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= import("mermaid").then((module) => module.default);
  return mermaidPromise;
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function decodeSource(encoded: string): string {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function initMermaid(): Promise<MermaidApi> {
  const mermaid = await loadMermaid();
  const dark = isDark();
  renderedTheme = dark;
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? "dark" : "neutral",
    fontFamily: "var(--font-mono)",
    securityLevel: "loose",
  });
  return mermaid;
}

async function renderBlock(block: HTMLElement): Promise<void> {
  const encoded = block.getAttribute("data-diagram-source") ?? "";
  const panLayer = block.querySelector<HTMLElement>("[data-diagram-pan]");
  const viewport = block.querySelector<HTMLElement>("[data-diagram-viewport]");
  if (!encoded || !panLayer || !viewport) return;

  const code = decodeSource(encoded);
  if (!code.trim()) return;

  if (!block.id) block.id = `mermaid-${++idCounter}`;

  try {
    const mermaid = await initMermaid();
    const svgId = `${block.id}-svg`;
    document.getElementById(svgId)?.remove();
    const { svg } = await mermaid.render(svgId, code);
    panLayer.innerHTML = svg;
    const svgEl = panLayer.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);

    block.classList.remove("is-error");
    block.classList.add("is-rendered");

    let controls = controlsByBlock.get(block);
    if (!controls) {
      const zoomLevel = block.querySelector("[data-diagram-zoom-level]");
      const hint = block.querySelector<HTMLElement>(".diagram-hint");
      controls = setupPanZoom(viewport, panLayer, zoomLevel, hint);
      controlsByBlock.set(block, controls);
      bindDiagramControls(block, controls);
    }
    requestAnimationFrame(() => controls.fitToViewport());
  } catch (error) {
    block.classList.remove("is-rendered");
    block.classList.add("is-error");
    console.error("[mermaid] failed to render:", error);
  }
}

function queueRender(block: HTMLElement) {
  if (block.hasAttribute("data-mermaid-queued")) return;
  block.setAttribute("data-mermaid-queued", "");
  renderQueue = renderQueue.then(() => renderBlock(block));
}

function observeBlocks() {
  const blocks = document.querySelectorAll<HTMLElement>("[data-mermaid]");
  if (blocks.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    blocks.forEach((block) => queueRender(block));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        self.unobserve(entry.target);
        queueRender(entry.target as HTMLElement);
      }
    },
    { rootMargin: "280px 0px" },
  );

  blocks.forEach((block) => {
    if (!block.hasAttribute("data-mermaid-queued")) observer.observe(block);
  });
}

function reRenderOnThemeChange() {
  const rendered = document.querySelectorAll<HTMLElement>("[data-mermaid].is-rendered");
  if (rendered.length === 0) return;
  if (renderedTheme === isDark()) return;
  rendered.forEach((block) => {
    renderQueue = renderQueue.then(() => renderBlock(block));
  });
}

observeBlocks();
document.addEventListener("astro:page-load", observeBlocks);

const themeObserver = new MutationObserver(() => reRenderOnThemeChange());
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
