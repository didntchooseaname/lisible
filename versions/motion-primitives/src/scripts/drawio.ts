
function setupViewer(container: HTMLElement) {
  const viewport = container.querySelector<HTMLElement>("[data-drawio-viewport]");
  const pan = container.querySelector<HTMLElement>("[data-drawio-pan]");
  const levelEl = container.querySelector("[data-drawio-zoom-level]");
  const hintEl = container.querySelector<HTMLElement>("[data-drawio-hint]");
  if (!viewport || !pan) return;

  let scale = 1;
  let x = 0;
  let y = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;
  let hintHidden = false;

  const hideHint = () => {
    if (!hintHidden && hintEl) {
      hintEl.style.opacity = "0";
      hintHidden = true;
    }
  };
  const level = () => {
    if (levelEl) levelEl.textContent = `${Math.round(scale * 100)}%`;
  };
  const apply = () => {
    pan.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    pan.style.transformOrigin = "center center";
    level();
  };
  const zoomIn = () => {
    scale = Math.min(scale * 1.25, 12);
    apply();
    hideHint();
  };
  const zoomOut = () => {
    scale = Math.max(scale / 1.25, 0.3);
    apply();
    hideHint();
  };
  const reset = () => {
    scale = 1;
    x = 0;
    y = 0;
    apply();
  };

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.deltaY < 0) scale = Math.min(scale * 1.1, 12);
      else scale = Math.max(scale / 1.1, 0.3);
      apply();
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
    apply();
  });
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  container.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", zoomIn);
  container.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", zoomOut);
  container.querySelector("[data-drawio-zoom-reset]")?.addEventListener("click", reset);

  apply();
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
  document
    .querySelectorAll<HTMLElement>("[data-drawio-container]")
    .forEach((c) => observe(c));
}

document.addEventListener("astro:page-load", init);
