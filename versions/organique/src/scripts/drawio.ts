function decodeEntities(value: string): string {
  return value;
}

function setupPanZoom(container: HTMLElement) {
  const viewport = container.querySelector<HTMLElement>("[data-drawio-viewport]");
  const pan = container.querySelector<HTMLElement>("[data-drawio-pan]");
  const level = container.querySelector<HTMLElement>("[data-drawio-zoom-level]");
  const hint = container.querySelector<HTMLElement>("[data-drawio-hint]");
  if (!viewport || !pan) return;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let panning = false;
  let sx = 0;
  let sy = 0;

  const apply = () => {
    pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    pan.style.transformOrigin = "center center";
    if (level) level.textContent = `${Math.round(scale * 100)}%`;
  };
  const hideHint = () => {
    if (hint) hint.style.opacity = "0";
  };
  const fit = () => {
    const svg = pan.querySelector<SVGSVGElement>("svg");
    const rect = viewport.getBoundingClientRect();
    const vb = svg?.viewBox.baseVal;
    const cw = vb?.width || svg?.clientWidth || 0;
    const ch = vb?.height || svg?.clientHeight || 0;
    if (!cw || !ch || !rect.width || !rect.height) {
      scale = 1;
      tx = 0;
      ty = 0;
      apply();
      return;
    }
    const pad = 40;
    scale = Math.min((rect.width - pad) / cw, (rect.height - pad) / ch);
    scale = Math.min(Math.max(scale, 0.2), 8);
    tx = 0;
    ty = 0;
    apply();
  };

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale = e.deltaY < 0 ? Math.min(scale * 1.1, 8) : Math.max(scale / 1.1, 0.2);
      apply();
      hideHint();
    },
    { passive: false },
  );
  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    panning = true;
    sx = e.clientX - tx;
    sy = e.clientY - ty;
    viewport.style.cursor = "grabbing";
    viewport.setPointerCapture(e.pointerId);
    hideHint();
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    tx = e.clientX - sx;
    ty = e.clientY - sy;
    apply();
  });
  const stop = () => {
    panning = false;
    viewport.style.cursor = "grab";
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  container.querySelector("[data-drawio-zoom-in]")?.addEventListener("click", () => {
    scale = Math.min(scale * 1.25, 8);
    apply();
    hideHint();
  });
  container.querySelector("[data-drawio-zoom-out]")?.addEventListener("click", () => {
    scale = Math.max(scale / 1.25, 0.2);
    apply();
    hideHint();
  });
  container.querySelector("[data-drawio-reset]")?.addEventListener("click", fit);

  requestAnimationFrame(fit);
}

async function loadDiagram(container: HTMLElement) {
  const src = container.getAttribute("data-src");
  const target = container.querySelector<HTMLElement>("[data-drawio-render]");
  const loading = container.querySelector<HTMLElement>("[data-drawio-loading]");
  const outer = container.closest(".diagram-outer");
  const fallback = outer?.querySelector<HTMLElement>("[data-drawio-fallback]");
  if (!src || !target) return;

  if (fallback) fallback.hidden = true;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!/<svg[\s>]/i.test(text)) throw new Error("not svg");
    target.innerHTML = decodeEntities(text);
    const svg = target.querySelector<SVGSVGElement>("svg");
    if (svg) {
      const viewBox = svg.viewBox.baseVal;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.style.display = "block";
      svg.style.maxWidth = "none";
      if (viewBox.width > 0 && viewBox.height > 0) {
        svg.style.width = `${viewBox.width}px`;
        svg.style.height = `${viewBox.height}px`;
      }
    }
    if (loading) loading.style.display = "none";
    if (fallback) fallback.hidden = true;
    setupPanZoom(container);
  } catch {
    container.hidden = true;
    if (fallback) fallback.hidden = false;
  }
}

function observe(container: HTMLElement) {
  if (container.hasAttribute("data-drawio-loaded")) return;
  container.setAttribute("data-drawio-loaded", "");
  if (!("IntersectionObserver" in window)) {
    loadDiagram(container);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      loadDiagram(container);
    },
    { rootMargin: "300px 0px" },
  );
  observer.observe(container);
}

function initDrawio() {
  document.querySelectorAll<HTMLElement>("[data-drawio]").forEach(observe);
}

document.addEventListener("astro:page-load", initDrawio);
