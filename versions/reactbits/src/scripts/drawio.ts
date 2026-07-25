import { setupPanZoom } from "../../../../shared/scripts/pan-zoom";

function setupViewer(figure: HTMLElement) {
  if (figure.hasAttribute("data-drawio-ready")) return;
  figure.setAttribute("data-drawio-ready", "");

  const img = figure.querySelector<HTMLImageElement>("img");
  if (!img) return;

  const viewport = document.createElement("div");
  viewport.className = "drawio-viewport";
  const pan = document.createElement("div");
  pan.className = "drawio-pan";

  const host = img.closest("p") ?? img;
  pan.appendChild(img);
  viewport.appendChild(pan);
  const toolbar = figure.querySelector(".drawio-toolbar");
  if (toolbar) toolbar.after(viewport);
  else figure.appendChild(viewport);
  if (host !== img && host.parentElement) host.remove();

  img.setAttribute("draggable", "false");

  const zoomLevel = figure.querySelector("[data-drawio-zoom-level]");
  const controls = setupPanZoom(viewport, pan, {
    minScale: 0.4,
    maxScale: 8,
    zoomLevelEl: zoomLevel,
    setTransformOrigin: false,
    grabCursor: false,
  });

  figure.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", controls.zoomIn);
  figure.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", controls.zoomOut);
  figure.querySelector("[data-drawio-zoom-reset]")?.addEventListener("click", controls.reset);

  controls.reset();
}

function initAll() {
  const figures = document.querySelectorAll<HTMLElement>("[data-drawio]");
  figures.forEach((figure) => {
    if (!("IntersectionObserver" in window)) {
      setupViewer(figure);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        setupViewer(figure);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(figure);
  });
}

document.addEventListener("astro:page-load", initAll);
if (document.readyState !== "loading") initAll();
