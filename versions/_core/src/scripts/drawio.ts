interface DrawioControls {
  fit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const controlsByContainer = new WeakMap<HTMLElement, DrawioControls>();

function setupPanZoom(viewport: HTMLElement, panLayer: HTMLElement, levelEl: Element | null): DrawioControls {
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

  function contentSize() {
    const media = panLayer.querySelector<HTMLElement>("img, svg");
    if (!media) return null;
    const rect = media.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return { width: rect.width / scale, height: rect.height / scale };
  }

  function fit() {
    const size = contentSize();
    const rect = viewport.getBoundingClientRect();
    if (!size || !rect.width || !rect.height) {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
      return;
    }
    const pad = 32;
    scale = Math.min((rect.width - pad) / size.width, (rect.height - pad) / size.height, 1);
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

function enhance(container: HTMLElement) {
  if (container.hasAttribute("data-drawio-ready")) return;
  container.setAttribute("data-drawio-ready", "");

  const viewport = container.querySelector<HTMLElement>("[data-drawio-viewport]");
  const panLayer = container.querySelector<HTMLElement>("[data-drawio-pan]");
  const levelEl = container.querySelector("[data-drawio-zoom-level]");
  if (!viewport || !panLayer) return;

  const img = panLayer.querySelector<HTMLImageElement>("img");
  const controls = setupPanZoom(viewport, panLayer, levelEl);
  controlsByContainer.set(container, controls);
  viewport.style.cursor = "grab";

  const runFit = () => requestAnimationFrame(() => controls.fit());
  if (img && !img.complete) img.addEventListener("load", runFit, { once: true });
  runFit();

  container.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-drawio-zoom-reset]")?.addEventListener("click", controls.fit);
}

function observe(container: HTMLElement) {
  if (container.hasAttribute("data-drawio-ready") || container.hasAttribute("data-drawio-observed")) return;
  if (!("IntersectionObserver" in window)) {
    enhance(container);
    return;
  }
  container.setAttribute("data-drawio-observed", "");
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      container.removeAttribute("data-drawio-observed");
      enhance(container);
    },
    { rootMargin: "300px 0px" },
  );
  observer.observe(container);
}

function initDrawio() {
  document.querySelectorAll<HTMLElement>("[data-drawio]").forEach(observe);
}

function reFitForTheme() {
  document
    .querySelectorAll<HTMLElement>("[data-drawio][data-drawio-ready]")
    .forEach((container) => controlsByContainer.get(container)?.fit());
}

initDrawio();
document.addEventListener("astro:page-load", initDrawio);

let themeTimer: number | null = null;
const themeObserver = new MutationObserver(() => {
  if (themeTimer !== null) window.clearTimeout(themeTimer);
  themeTimer = window.setTimeout(() => {
    themeTimer = null;
    reFitForTheme();
  }, 60);
});
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
