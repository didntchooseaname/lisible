import { bindDiagramControls, prepareSvg, setupPanZoom } from "@/lib/pan-zoom";

async function loadBlock(block: HTMLElement): Promise<void> {
  const src = block.getAttribute("data-diagram-src") ?? "";
  const panLayer = block.querySelector<HTMLElement>("[data-diagram-pan]");
  const viewport = block.querySelector<HTMLElement>("[data-diagram-viewport]");
  if (!src || !panLayer || !viewport) return;

  if (/\.drawio(\.xml)?$/i.test(src)) {
    block.classList.add("is-error");
    return;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    if (text.includes("<svg")) {
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const svgEl = doc.documentElement;
      if (svgEl.nodeName.toLowerCase() !== "svg") throw new Error("source is not SVG");
      const adopted = document.importNode(svgEl, true) as unknown as SVGSVGElement;
      adopted.setAttribute("aria-hidden", "true");
      panLayer.replaceChildren(adopted);
      prepareSvg(adopted);
    } else {
      const img = new Image();
      img.src = src;
      img.alt = "";
      await img.decode();
      panLayer.replaceChildren(img);
    }

    block.classList.add("is-rendered");

    const zoomLevel = block.querySelector("[data-diagram-zoom-level]");
    const hint = block.querySelector<HTMLElement>(".diagram-hint");
    const controls = setupPanZoom(viewport, panLayer, zoomLevel, hint);
    bindDiagramControls(block, controls);
    requestAnimationFrame(() => controls.fitToViewport());
  } catch (error) {
    block.classList.add("is-error");
    console.error("[drawio] failed to load:", error);
  }
}

function observeBlocks() {
  const blocks = document.querySelectorAll<HTMLElement>("[data-drawio]");
  if (blocks.length === 0) return;

  const start = (block: HTMLElement) => {
    if (block.hasAttribute("data-drawio-loaded")) return;
    block.setAttribute("data-drawio-loaded", "");
    void loadBlock(block);
  };

  if (!("IntersectionObserver" in window)) {
    blocks.forEach(start);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        self.unobserve(entry.target);
        start(entry.target as HTMLElement);
      }
    },
    { rootMargin: "280px 0px" },
  );

  blocks.forEach((block) => {
    if (!block.hasAttribute("data-drawio-loaded")) observer.observe(block);
  });
}

observeBlocks();
document.addEventListener("astro:page-load", observeBlocks);
