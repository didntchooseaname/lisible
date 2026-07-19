
export interface PanZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToViewport: () => void;
  destroy: () => void;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 20;

export function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  zoomLevelEl?: Element | null,
  hintEl?: HTMLElement | null,
): PanZoomControls {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let hintHidden = false;
  const abort = new AbortController();
  const { signal } = abort;

  function hideHint() {
    if (hintHidden || !hintEl) return;
    hintHidden = true;
    hintEl.style.opacity = "0";
    window.setTimeout(() => {
      hintEl.style.display = "none";
    }, 400);
  }

  function applyTransform() {
    panLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    panLayer.style.transformOrigin = "center center";
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }

  function zoomBy(factor: number) {
    scale = Math.min(Math.max(scale * factor, MIN_SCALE), MAX_SCALE);
    applyTransform();
    hideHint();
  }

  function contentSize(): { width: number; height: number } | null {
    const svg = panLayer.querySelector<SVGSVGElement>("svg");
    const viewBox = svg?.viewBox.baseVal;
    if (viewBox?.width && viewBox?.height) {
      return { width: viewBox.width, height: viewBox.height };
    }
    const el = panLayer.firstElementChild as HTMLElement | null;
    const rect = el?.getBoundingClientRect();
    if (rect?.width && rect?.height) {
      return { width: rect.width / scale, height: rect.height / scale };
    }
    return null;
  }

  function fitToViewport() {
    const size = contentSize();
    const rect = viewport.getBoundingClientRect();
    if (!size || !rect.width || !rect.height) return;
    const padding = 40;
    const available = {
      width: Math.max(rect.width - padding, 1),
      height: Math.max(rect.height - padding, 1),
    };
    scale = Math.min(available.width / size.width, available.height / size.height, 1.5);
    scale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? 1.1 : 1 / 1.1);
    },
    { passive: false, signal },
  );

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      isPanning = true;
      startX = event.clientX - translateX;
      startY = event.clientY - translateY;
      viewport.style.cursor = "grabbing";
      viewport.setPointerCapture(event.pointerId);
      hideHint();
    },
    { signal },
  );

  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (!isPanning) return;
      translateX = event.clientX - startX;
      translateY = event.clientY - startY;
      applyTransform();
    },
    { signal },
  );

  const endPan = () => {
    isPanning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", endPan, { signal });
  viewport.addEventListener("pointercancel", endPan, { signal });

  viewport.style.cursor = "grab";

  return {
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(1 / 1.25),
    fitToViewport,
    destroy: () => abort.abort(),
  };
}

export function bindDiagramControls(block: HTMLElement, controls: PanZoomControls): void {
  block
    .querySelector("[data-diagram-zoom-in]")
    ?.addEventListener("click", () => controls.zoomIn());
  block
    .querySelector("[data-diagram-zoom-out]")
    ?.addEventListener("click", () => controls.zoomOut());
  block
    .querySelector("[data-diagram-reset]")
    ?.addEventListener("click", () => controls.fitToViewport());
}

export function prepareSvg(svgEl: SVGSVGElement): void {
  const viewBox = svgEl.viewBox.baseVal;
  if (viewBox?.width && viewBox?.height) {
    svgEl.setAttribute("width", `${viewBox.width}`);
    svgEl.setAttribute("height", `${viewBox.height}`);
  }
  svgEl.style.display = "block";
  svgEl.style.maxWidth = "none";
  svgEl.style.maxHeight = "none";
}
