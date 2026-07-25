import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

function setupViewer(container: HTMLElement) {
  const viewport = container.querySelector<HTMLElement>("[data-drawio-viewport]");
  const pan = container.querySelector<HTMLElement>("[data-drawio-pan]");
  const levelEl = container.querySelector("[data-drawio-zoom-level]");
  const hintEl = container.querySelector<HTMLElement>("[data-drawio-hint]");
  if (!viewport || !pan) return;

  const controls = setupPanZoom(viewport, pan, {
    minScale: 0.3,
    maxScale: 12,
    zoomLevelEl: levelEl,
    hintEl,
    hintMode: "fade",
    grabCursor: false,
  });

  container.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-drawio-zoom-reset]")?.addEventListener("click", controls.reset);

  controls.reset();
}

function observe(container: HTMLElement) {
  if (container.hasAttribute("data-drawio-ready")) return;
  const start = () => {
    if (container.hasAttribute("data-drawio-ready")) return;
    container.setAttribute("data-drawio-ready", "");
    setupViewer(container);
  };
  if (!("IntersectionObserver" in window)) {
    start();
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      start();
    },
    { rootMargin: "300px 0px" },
  );
  io.observe(container);
}

function init() {
  document.querySelectorAll<HTMLElement>("[data-drawio-container]").forEach((c) => observe(c));
}

document.addEventListener("astro:page-load", init);
