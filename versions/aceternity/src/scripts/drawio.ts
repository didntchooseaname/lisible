function setupPanZoom(
  viewport: HTMLElement,
  panLayer: HTMLElement,
  zoomLevelEl?: Element | null,
) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;

  function apply() {
    panLayer.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    panLayer.style.transformOrigin = "center center";
    if (zoomLevelEl) zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }
  function zoomIn() {
    scale = Math.min(scale * 1.25, 12);
    apply();
  }
  function zoomOut() {
    scale = Math.max(scale / 1.25, 0.4);
    apply();
  }
  function reset() {
    scale = 1;
    tx = 0;
    ty = 0;
    apply();
  }

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale = e.deltaY < 0 ? Math.min(scale * 1.1, 12) : Math.max(scale / 1.1, 0.4);
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
  viewport.addEventListener("pointerup", () => {
    panning = false;
    viewport.style.cursor = "grab";
  });

  return { zoomIn, zoomOut, reset };
}

async function inlineSvg(panLayer: HTMLElement, src: string) {
  if (!src.toLowerCase().endsWith(".svg")) return;
  try {
    const res = await fetch(src);
    if (!res.ok) return;
    const text = await res.text();
    if (!text.includes("<svg")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "drawio-inline";
    wrapper.innerHTML = text;
    const svg = wrapper.querySelector("svg");
    if (!svg) return;
    svg.style.display = "block";
    svg.style.maxWidth = "100%";
    svg.style.height = "auto";
    panLayer.replaceChildren(wrapper);
  } catch {
  }
}

function initDrawio(container: HTMLElement) {
  if (container.hasAttribute("data-drawio-ready")) return;
  container.setAttribute("data-drawio-ready", "");

  const viewport = container.querySelector<HTMLElement>("[data-drawio-viewport]");
  const panLayer = container.querySelector<HTMLElement>("[data-drawio-pan]");
  const zoomLevel = container.querySelector("[data-drawio-zoom-level]");
  if (!viewport || !panLayer) return;

  const controls = setupPanZoom(viewport, panLayer, zoomLevel);
  container.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", controls.zoomIn);
  container.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", controls.zoomOut);
  container.querySelector("[data-drawio-reset]")?.addEventListener("click", controls.reset);

  const src = container.getAttribute("data-drawio-src") || "";
  if (src) void inlineSvg(panLayer, src);
}

function observeAll() {
  const containers = document.querySelectorAll<HTMLElement>("[data-drawio]");
  if (!("IntersectionObserver" in window)) {
    containers.forEach(initDrawio);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          initDrawio(entry.target as HTMLElement);
        }
      });
    },
    { rootMargin: "300px 0px" },
  );
  containers.forEach((container) => {
    if (!container.hasAttribute("data-drawio-ready")) observer.observe(container);
  });
}

observeAll();
document.addEventListener("astro:page-load", observeAll);
