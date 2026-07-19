function iconButton(label: string, path: string): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "drawio-btn";
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  return btn;
}

function setupPanZoom(
  viewport: HTMLElement,
  pan: HTMLElement,
  zoomLevelEl: HTMLElement,
) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let startX = 0;
  let startY = 0;

  function apply() {
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    pan.style.transformOrigin = "center center";
    zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
  }
  function zoom(factor: number) {
    scale = Math.min(Math.max(scale * factor, 0.2), 20);
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
      zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1);
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

  return { zoomIn: () => zoom(1.25), zoomOut: () => zoom(1 / 1.25), reset };
}

function mount(embed: HTMLElement) {
  if (embed.hasAttribute("data-drawio-done")) return;
  const img = embed.querySelector<HTMLImageElement>("img");
  if (!img) return;
  embed.setAttribute("data-drawio-done", "");

  const title = embed.dataset.drawioTitle ?? "draw.io";
  const labelIn = embed.dataset.labelZoomin ?? "Zoom in";
  const labelOut = embed.dataset.labelZoomout ?? "Zoom out";
  const labelReset = embed.dataset.labelReset ?? "Reset view";

  const toolbar = document.createElement("div");
  toolbar.className = "drawio-toolbar";
  const titleEl = document.createElement("span");
  titleEl.className = "drawio-label";
  titleEl.textContent = title;

  const controls = document.createElement("div");
  controls.className = "drawio-controls";
  const zoomLevel = document.createElement("span");
  zoomLevel.className = "drawio-zoom-level";
  zoomLevel.textContent = "100%";

  const outBtn = iconButton(
    labelOut,
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>',
  );
  const resetBtn = iconButton(
    labelReset,
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  );
  const inBtn = iconButton(
    labelIn,
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>',
  );
  controls.append(outBtn, zoomLevel, inBtn, resetBtn);
  toolbar.append(titleEl, controls);

  const wrapper = img.closest("p") ?? img;
  const viewport = document.createElement("div");
  viewport.className = "drawio-viewport";
  viewport.style.cursor = "grab";
  const pan = document.createElement("div");
  pan.className = "drawio-pan";
  pan.appendChild(img);
  viewport.appendChild(pan);

  embed.innerHTML = "";
  embed.append(toolbar, viewport);
  if (wrapper !== img && wrapper.parentElement) wrapper.remove();

  const pz = setupPanZoom(viewport, pan, zoomLevel);
  inBtn.addEventListener("click", pz.zoomIn);
  outBtn.addEventListener("click", pz.zoomOut);
  resetBtn.addEventListener("click", pz.reset);
}

function observe(embed: HTMLElement) {
  if (
    embed.hasAttribute("data-drawio-done") ||
    embed.hasAttribute("data-drawio-observed")
  )
    return;
  if (!("IntersectionObserver" in window)) {
    mount(embed);
    return;
  }
  embed.setAttribute("data-drawio-observed", "");
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      embed.removeAttribute("data-drawio-observed");
      mount(embed);
    },
    { rootMargin: "300px 0px" },
  );
  io.observe(embed);
}

function mountAll() {
  document
    .querySelectorAll<HTMLElement>("[data-drawio]")
    .forEach((embed) => observe(embed));
}

mountAll();
document.addEventListener("astro:page-load", mountAll);
