/**
 * Shared pan and zoom engine for the diagram viewers, promoted from the h4x0r
 * variant: the option defaults reproduce its behavior exactly. Other variants
 * tune the axes their historical inline forks used: zoom bounds, fit
 * geometry and fallback, hint fading, transform origin and cursor handling.
 * Variants whose inline logic differs functionally, or whose compiled script
 * is inlined into the rendered HTML, keep their forks.
 */

export interface PanZoomControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToViewport: () => void;
  reset: () => void;
  destroy: () => void;
}

export interface PanZoomFitOptions {
  /** Padding subtracted from the viewport before computing the fit scale. */
  padding?: number;
  /** Hard cap of the fit scale, applied before clamping. */
  cap?: number;
  /** Upper clamp of the fit scale; defaults to maxScale. */
  clampMax?: number;
  /** What happens when the content or viewport size is unknown. */
  fallback?: "reset" | "none";
  /** "auto" falls back to the first child box when the svg viewBox is unusable. */
  content?: "auto" | "svg-viewbox";
}

export interface PanZoomOptions {
  /** Zoom bounds. */
  minScale?: number;
  maxScale?: number;
  /** Element showing the rounded zoom percentage. */
  zoomLevelEl?: Element | null;
  /** Hint element hidden on the first interaction. */
  hintEl?: HTMLElement | null;
  /** "collapse" fades then removes the hint from the flow, "fade" only fades. */
  hintMode?: "collapse" | "fade";
  /** Whether applying the transform also pins transform-origin center center. */
  setTransformOrigin?: boolean;
  /** Whether the grab cursor is set on the viewport at setup time. */
  grabCursor?: boolean;
  fit?: PanZoomFitOptions;
}

export function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  options: PanZoomOptions = {},
): PanZoomControls {
  const minScale = options.minScale ?? 0.2;
  const maxScale = options.maxScale ?? 20;
  const zoomLevelEl = options.zoomLevelEl ?? null;
  const hintEl = options.hintEl ?? null;
  const hintMode = options.hintMode ?? "collapse";
  const setTransformOrigin = options.setTransformOrigin ?? true;
  const fitPadding = options.fit?.padding ?? 40;
  const fitCap = options.fit?.cap ?? 1.5;
  const fitClampMax = options.fit?.clampMax ?? maxScale;
  const fitFallback = options.fit?.fallback ?? "none";
  const fitContent = options.fit?.content ?? "auto";

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
    if (hintMode === "collapse") {
      window.setTimeout(() => {
        hintEl.style.display = "none";
      }, 400);
    }
  }

  function applyTransform() {
    panLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    if (setTransformOrigin) panLayer.style.transformOrigin = "center center";
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }

  function zoomBy(factor: number) {
    scale = Math.min(Math.max(scale * factor, minScale), maxScale);
    applyTransform();
    hideHint();
  }

  function reset() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function contentSize(): { width: number; height: number } | null {
    const svg = panLayer.querySelector<SVGSVGElement>("svg");
    const viewBox = svg?.viewBox.baseVal;
    if (viewBox?.width && viewBox?.height) {
      return { width: viewBox.width, height: viewBox.height };
    }
    if (fitContent === "auto") {
      const el = panLayer.firstElementChild as HTMLElement | null;
      const rect = el?.getBoundingClientRect();
      if (rect?.width && rect?.height) {
        return { width: rect.width / scale, height: rect.height / scale };
      }
    }
    return null;
  }

  function fitToViewport() {
    const size = contentSize();
    const rect = viewport.getBoundingClientRect();
    if (!size || !rect.width || !rect.height) {
      if (fitFallback === "reset") reset();
      return;
    }
    const available = {
      width: Math.max(rect.width - fitPadding, 1),
      height: Math.max(rect.height - fitPadding, 1),
    };
    scale = Math.min(available.width / size.width, available.height / size.height, fitCap);
    scale = Math.min(Math.max(scale, minScale), fitClampMax);
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

  if (options.grabCursor ?? true) viewport.style.cursor = "grab";

  return {
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(1 / 1.25),
    fitToViewport,
    reset,
    destroy: () => abort.abort(),
  };
}

export function bindDiagramControls(block: HTMLElement, controls: PanZoomControls): void {
  block.querySelector("[data-diagram-zoom-in]")?.addEventListener("click", () => controls.zoomIn());
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
    // The pan layer is a flex container, so without a fixed basis the diagram
    // shrinks to the column width and the fit transform then scales that down
    // again: the result is an unreadable thumbnail. Pin the intrinsic size and
    // let the transform be the only thing that scales.
    svgEl.style.width = `${viewBox.width}px`;
    svgEl.style.height = `${viewBox.height}px`;
    svgEl.style.flex = "0 0 auto";
  }
  svgEl.style.display = "block";
  svgEl.style.maxWidth = "none";
  svgEl.style.maxHeight = "none";
}
