type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenFrame = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

interface ZoomController {
  sync(): void;
}

const FRAME_SELECTOR = [
  "[data-mermaid-container]",
  "[data-mermaid]",
  "[data-drawio-container]",
  "[data-drawio]",
  "[data-infographic]",
].join(", ");

const CONTROLS_SELECTOR = [
  ".mermaid-actions",
  ".mermaid-toolbar__actions",
  ".mermaid-controls",
  ".drawio-actions",
  ".drawio-toolbar__actions",
  ".drawio-controls",
  ".diagram-actions",
  ".diagram-controls",
  ".edr-infographic__actions",
].join(", ");

const TOOLBAR_SELECTOR = [
  ".mermaid-toolbar",
  ".drawio-toolbar",
  ".diagram-toolbar",
  ".edr-infographic__toolbar",
].join(", ");

const BUTTON_SELECTOR = "[data-diagram-fullscreen]";
const STYLE_ID = "lisible-diagram-fullscreen-styles";
const zoomControllers = new WeakMap<HTMLElement, ZoomController>();

const expandIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"/></svg>`;
const collapseIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M21 16h-5v5"/></svg>`;
const zoomOutIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/></svg>`;
const zoomInIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>`;
const fitIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`;

function fullscreenElement() {
  const current = document as FullscreenDocument;
  return document.fullscreenElement ?? current.webkitFullscreenElement ?? null;
}

function copy() {
  const french = document.documentElement.lang.toLowerCase().startsWith("fr");
  return french
    ? {
        enter: "Afficher le diagramme en plein écran",
        exit: "Quitter le plein écran",
        zoomIn: "Agrandir le diagramme",
        zoomOut: "Réduire le diagramme",
        fit: "Ajuster le diagramme à l’écran",
      }
    : {
        enter: "View diagram in full screen",
        exit: "Exit full screen",
        zoomIn: "Zoom in",
        zoomOut: "Zoom out",
        fit: "Fit diagram to screen",
      };
}

function isExpanded(frame: HTMLElement) {
  return fullscreenElement() === frame || frame.hasAttribute("data-diagram-fullscreen-fallback");
}

function update() {
  const labels = copy();
  document.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR).forEach((button) => {
    const frame = button.closest<HTMLElement>(FRAME_SELECTOR);
    const expanded = Boolean(frame && isExpanded(frame));
    button.innerHTML = expanded ? collapseIcon : expandIcon;
    button.setAttribute("aria-label", expanded ? labels.exit : labels.enter);
    button.setAttribute("title", expanded ? labels.exit : labels.enter);
    button.setAttribute("aria-pressed", String(expanded));
  });
  document.querySelectorAll<HTMLElement>("[data-infographic]").forEach((frame) => {
    zoomControllers.get(frame)?.sync();
  });
}

function closeFallback() {
  document.querySelectorAll<HTMLElement>("[data-diagram-fullscreen-fallback]").forEach((frame) => {
    frame.removeAttribute("data-diagram-fullscreen-fallback");
  });
  document.documentElement.classList.remove("diagram-fullscreen-open");
  update();
}

function openFallback(frame: HTMLElement) {
  closeFallback();
  frame.setAttribute("data-diagram-fullscreen-fallback", "");
  document.documentElement.classList.add("diagram-fullscreen-open");
  update();
}

async function toggleFullscreen(frame: FullscreenFrame) {
  if (frame.hasAttribute("data-diagram-fullscreen-fallback")) {
    closeFallback();
    return;
  }
  if (fullscreenElement() === frame) {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await (document as FullscreenDocument).webkitExitFullscreen?.();
    return;
  }
  try {
    if (frame.requestFullscreen) await frame.requestFullscreen();
    else if (frame.webkitRequestFullscreen) await frame.webkitRequestFullscreen();
    else openFallback(frame);
  } catch {
    openFallback(frame);
  }
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .diagram-fullscreen-frame{position:relative}
    .diagram-fullscreen-floating{position:absolute;z-index:12;top:.65rem;right:.65rem;display:inline-grid;width:2.5rem;height:2.5rem;padding:0;place-items:center;border:1px solid var(--color-border,var(--border,#7777));border-radius:var(--radius-md,.5rem);color:var(--color-foreground,var(--foreground,currentColor));background:var(--color-card,var(--card,Canvas));cursor:pointer}
    .edr-infographic__button{display:inline-grid!important;width:2rem!important;height:2rem!important;padding:0!important;place-items:center!important;border:0!important;border-radius:var(--radius-sm,.25rem)!important;color:var(--color-muted-foreground,var(--muted-foreground,currentColor))!important;background:transparent!important;cursor:pointer!important}
    .edr-infographic__button:hover{color:var(--color-foreground,var(--foreground,currentColor))!important;background:var(--color-secondary,var(--secondary,transparent))!important}
    .edr-infographic__button svg{display:block!important;width:1rem!important;height:1rem!important;margin:0!important}
    .diagram-zoom-control,.diagram-zoom-level{display:none!important}
    .diagram-zoom-level{min-width:3.25rem;padding-inline:.25rem;color:var(--color-muted-foreground,var(--muted-foreground,currentColor));font-size:.68rem;font-variant-numeric:tabular-nums;text-align:center}
    .diagram-fullscreen-frame:fullscreen,.diagram-fullscreen-frame[data-diagram-fullscreen-fallback]{display:flex!important;width:100vw!important;max-width:none!important;height:100dvh!important;max-height:none!important;margin:0!important;padding:0!important;flex-direction:column;border:0!important;border-radius:0!important;color:var(--color-foreground,var(--foreground,CanvasText));background:var(--color-background,var(--background,Canvas))}
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback]{position:fixed!important;z-index:2147483646!important;inset:0!important}
    .diagram-fullscreen-frame:fullscreen :is([data-mermaid-viewport],[data-drawio-viewport],[data-infographic-viewport]),.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] :is([data-mermaid-viewport],[data-drawio-viewport],[data-infographic-viewport]){flex:1 1 auto!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;border-radius:0!important}
    .diagram-fullscreen-frame:fullscreen [data-infographic-viewport],.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] [data-infographic-viewport]{display:block!important;overflow:auto!important;overscroll-behavior:contain;scrollbar-gutter:stable}
    [data-infographic-viewport][data-diagram-pannable]{cursor:grab;touch-action:none;user-select:none}
    [data-infographic-viewport][data-diagram-panning]{cursor:grabbing}
    .diagram-fullscreen-frame:fullscreen :is(.mermaid-toolbar,.drawio-toolbar,.diagram-toolbar,.edr-infographic__toolbar),.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] :is(.mermaid-toolbar,.drawio-toolbar,.diagram-toolbar,.edr-infographic__toolbar){flex:0 0 auto}
    .diagram-fullscreen-frame:fullscreen figcaption,.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] figcaption{flex:0 1 auto;max-height:28dvh;overflow:auto}
    .diagram-fullscreen-frame:fullscreen .diagram-zoom-control,.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] .diagram-zoom-control{display:inline-grid!important}
    .diagram-fullscreen-frame:fullscreen .diagram-zoom-level,.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] .diagram-zoom-level{display:inline-block!important}
    .diagram-zoom-stage{box-sizing:border-box;display:grid;min-width:100%;min-height:100%;padding:24px;place-items:center}
    .diagram-fullscreen-frame:fullscreen .diagram-zoom-stage>svg,.diagram-fullscreen-frame[data-diagram-fullscreen-fallback] .diagram-zoom-stage>svg{flex:none!important;max-width:none!important;max-height:none!important}
    html.diagram-fullscreen-open,html.diagram-fullscreen-open body{overflow:hidden!important}
  `;
  document.head.append(style);
}

function actionButton(target: HTMLElement, hook: string, icon: string, label: string) {
  const button = document.createElement("button");
  const reference = target.querySelector<HTMLButtonElement>("button");
  button.type = "button";
  button.dataset[hook] = "";
  button.className = `${reference?.className || "edr-infographic__button"} diagram-zoom-control`;
  button.innerHTML = icon;
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  return button;
}

function setupInfographicZoom(frame: HTMLElement, target: HTMLElement) {
  if (zoomControllers.has(frame)) return;
  const viewport = frame.querySelector<HTMLElement>("[data-infographic-viewport]");
  const svg = viewport?.querySelector<SVGSVGElement>("svg[viewBox]");
  const viewBox = svg?.viewBox.baseVal;
  if (!viewport || !svg || !viewBox?.width || !viewBox.height) return;

  const labels = copy();
  const zoomOut = actionButton(target, "diagramZoomOut", zoomOutIcon, labels.zoomOut);
  const zoomIn = actionButton(target, "diagramZoomIn", zoomInIcon, labels.zoomIn);
  const fit = actionButton(target, "diagramZoomFit", fitIcon, labels.fit);
  const level = document.createElement("span");
  level.className = "diagram-zoom-level";
  level.dataset.diagramZoomLevel = "";
  level.setAttribute("aria-live", "polite");
  level.textContent = "100%";
  target.append(zoomOut, level, zoomIn, fit);

  const stage = document.createElement("div");
  stage.className = "diagram-zoom-stage";
  svg.before(stage);
  stage.append(svg);

  const originalWidth = svg.style.width;
  const originalHeight = svg.style.height;
  const originalMaxWidth = svg.style.maxWidth;
  const originalMaxHeight = svg.style.maxHeight;
  let zoom = 1;
  let resizeFrame = 0;
  let panning = false;
  let panPointer = -1;
  let panStartX = 0;
  let panStartY = 0;
  let panScrollLeft = 0;
  let panScrollTop = 0;

  const restore = () => {
    stage.style.removeProperty("width");
    stage.style.removeProperty("height");
    svg.style.width = originalWidth;
    svg.style.height = originalHeight;
    svg.style.maxWidth = originalMaxWidth;
    svg.style.maxHeight = originalMaxHeight;
  };

  const render = () => {
    if (!isExpanded(frame)) {
      restore();
      return;
    }
    const bounds = viewport.getBoundingClientRect();
    const availableWidth = viewport.clientWidth || bounds.width;
    const availableHeight = viewport.clientHeight || bounds.height;
    if (availableWidth < 1 || availableHeight < 1) return;
    const padding = 48;
    const fitScale = Math.min(
      Math.max(1, availableWidth - padding) / viewBox.width,
      Math.max(1, availableHeight - padding) / viewBox.height,
    );
    const scale = fitScale * zoom;
    const width = Math.max(1, viewBox.width * scale);
    const height = Math.max(1, viewBox.height * scale);
    stage.style.width = `${Math.max(availableWidth, width + padding)}px`;
    stage.style.height = `${Math.max(availableHeight, height + padding)}px`;
    svg.style.setProperty("width", `${width}px`, "important");
    svg.style.setProperty("height", `${height}px`, "important");
    svg.style.setProperty("max-width", "none", "important");
    svg.style.setProperty("max-height", "none", "important");
    level.textContent = `${Math.round(zoom * 100)}%`;
    viewport.toggleAttribute(
      "data-diagram-pannable",
      viewport.scrollWidth > viewport.clientWidth + 1 || viewport.scrollHeight > viewport.clientHeight + 1,
    );
  };

  const schedule = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(render);
  };
  const setZoom = (next: number) => {
    zoom = Math.min(4, Math.max(0.35, next));
    render();
  };

  zoomOut.addEventListener("click", () => setZoom(zoom / 1.2));
  zoomIn.addEventListener("click", () => setZoom(zoom * 1.2));
  fit.addEventListener("click", () => setZoom(1));
  viewport.addEventListener("wheel", (event) => {
    if (!isExpanded(frame) || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    setZoom(event.deltaY < 0 ? zoom * 1.1 : zoom / 1.1);
  }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => {
    if (
      !isExpanded(frame)
      || event.button !== 0
      || !viewport.hasAttribute("data-diagram-pannable")
      || (event.target as Element | null)?.closest("button, a, input, select, textarea")
    ) return;
    panning = true;
    panPointer = event.pointerId;
    panStartX = event.clientX;
    panStartY = event.clientY;
    panScrollLeft = viewport.scrollLeft;
    panScrollTop = viewport.scrollTop;
    viewport.setAttribute("data-diagram-panning", "");
    viewport.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!panning || event.pointerId !== panPointer) return;
    viewport.scrollLeft = panScrollLeft - (event.clientX - panStartX);
    viewport.scrollTop = panScrollTop - (event.clientY - panStartY);
  });
  const stopPanning = (event: PointerEvent) => {
    if (!panning || event.pointerId !== panPointer) return;
    panning = false;
    panPointer = -1;
    viewport.removeAttribute("data-diagram-panning");
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener("pointerup", stopPanning);
  viewport.addEventListener("pointercancel", stopPanning);
  new ResizeObserver(schedule).observe(viewport);

  zoomControllers.set(frame, {
    sync() {
      if (isExpanded(frame)) {
        zoom = 1;
        requestAnimationFrame(() => requestAnimationFrame(render));
      } else {
        restore();
      }
    },
  });
}

function enhance(frame: HTMLElement) {
  if (frame.hasAttribute("data-diagram-fullscreen-ready")) return;
  frame.setAttribute("data-diagram-fullscreen-ready", "");
  frame.classList.add("diagram-fullscreen-frame");
  let target = frame.querySelector<HTMLElement>(CONTROLS_SELECTOR);
  const toolbar = frame.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
  if (!target && toolbar) {
    target = document.createElement("div");
    target.className = "diagram-fullscreen-controls";
    toolbar.append(target);
  }
  if (target && frame.matches("[data-infographic]")) setupInfographicZoom(frame, target);

  const button = document.createElement("button");
  const reference = target?.querySelector<HTMLButtonElement>("button");
  button.type = "button";
  button.dataset.diagramFullscreen = "";
  button.className = reference?.className.replace(/\s*diagram-zoom-control\b/, "")
    || (target?.matches(".edr-infographic__actions") ? "edr-infographic__button" : "diagram-fullscreen-floating");
  button.addEventListener("click", () => void toggleFullscreen(frame));
  (target ?? frame).append(button);
}

function init() {
  ensureStyles();
  document.querySelectorAll<HTMLElement>(FRAME_SELECTOR).forEach(enhance);
  update();
}

document.addEventListener("fullscreenchange", update);
document.addEventListener("webkitfullscreenchange", update);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("[data-diagram-fullscreen-fallback]")) closeFallback();
});
document.addEventListener("astro:page-load", init);
init();
