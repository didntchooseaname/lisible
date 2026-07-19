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

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;

  const zoomLevel = figure.querySelector("[data-drawio-zoom-level]");
  const apply = () => {
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    if (zoomLevel) zoomLevel.textContent = `${Math.round(scale * 100)}%`;
  };
  const reset = () => {
    scale = 1;
    tx = 0;
    ty = 0;
    apply();
  };

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale =
        e.deltaY < 0 ? Math.min(scale * 1.1, 8) : Math.max(scale / 1.1, 0.4);
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
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  figure
    .querySelector("[data-drawio-zoom-in]")
    ?.addEventListener("click", () => {
      scale = Math.min(scale * 1.25, 8);
      apply();
    });
  figure
    .querySelector("[data-drawio-zoom-out]")
    ?.addEventListener("click", () => {
      scale = Math.max(scale / 1.25, 0.4);
      apply();
    });
  figure
    .querySelector("[data-drawio-zoom-reset]")
    ?.addEventListener("click", reset);

  apply();
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
