type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenFrame = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const FRAME_SELECTOR = [
  "[data-mermaid-container]",
  "[data-mermaid]",
  "[data-drawio-container]",
  "[data-drawio]",
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
].join(", ");

const TOOLBAR_SELECTOR = ".mermaid-toolbar, .drawio-toolbar, .diagram-toolbar";
const BUTTON_SELECTOR = "[data-diagram-fullscreen]";
const STYLE_ID = "lisible-diagram-fullscreen-styles";

const expandIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"/></svg>`;
const collapseIcon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M21 16h-5v5"/></svg>`;

function fullscreenElement() {
  const current = document as FullscreenDocument;
  return document.fullscreenElement ?? current.webkitFullscreenElement ?? null;
}

function labels() {
  const french = document.documentElement.lang.toLowerCase().startsWith("fr");
  return french
    ? { enter: "Afficher le diagramme en plein écran", exit: "Quitter le plein écran" }
    : { enter: "View diagram in full screen", exit: "Exit full screen" };
}

function isExpanded(frame: HTMLElement) {
  return fullscreenElement() === frame || frame.hasAttribute("data-diagram-fullscreen-fallback");
}

function updateButtons() {
  const copy = labels();
  document.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR).forEach((button) => {
    const frame = button.closest<HTMLElement>(FRAME_SELECTOR);
    const expanded = Boolean(frame && isExpanded(frame));
    button.innerHTML = expanded ? collapseIcon : expandIcon;
    button.setAttribute("aria-label", expanded ? copy.exit : copy.enter);
    button.setAttribute("title", expanded ? copy.exit : copy.enter);
    button.setAttribute("aria-pressed", String(expanded));
  });
}

function closeFallback() {
  document.querySelectorAll<HTMLElement>("[data-diagram-fullscreen-fallback]").forEach((frame) => {
    frame.removeAttribute("data-diagram-fullscreen-fallback");
  });
  document.documentElement.classList.remove("diagram-fullscreen-open");
  updateButtons();
}

function openFallback(frame: HTMLElement) {
  closeFallback();
  frame.setAttribute("data-diagram-fullscreen-fallback", "");
  document.documentElement.classList.add("diagram-fullscreen-open");
  updateButtons();
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
    .diagram-fullscreen-frame { position: relative; }
    .diagram-fullscreen-floating {
      position: absolute;
      z-index: 12;
      top: .65rem;
      right: .65rem;
      display: inline-grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      border: 1px solid var(--color-border, var(--border, rgb(127 127 127 / .35)));
      border-radius: var(--radius-md, .5rem);
      color: var(--color-foreground, var(--foreground, currentColor));
      background: var(--color-card, var(--card, Canvas));
      cursor: pointer;
    }
    .diagram-fullscreen-frame:fullscreen,
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback] {
      display: flex !important;
      width: 100vw !important;
      max-width: none !important;
      height: 100dvh !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      flex-direction: column;
      border: 0 !important;
      border-radius: 0 !important;
      color: var(--color-foreground, var(--foreground, CanvasText));
      background: var(--color-background, var(--background, Canvas));
    }
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback] {
      position: fixed !important;
      z-index: 2147483646 !important;
      inset: 0 !important;
    }
    .diagram-fullscreen-frame:fullscreen [data-mermaid-viewport],
    .diagram-fullscreen-frame:fullscreen [data-drawio-viewport],
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback] [data-mermaid-viewport],
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback] [data-drawio-viewport] {
      flex: 1 1 auto !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      border-radius: 0 !important;
    }
    .diagram-fullscreen-frame:fullscreen :is(.mermaid-toolbar, .drawio-toolbar, .diagram-toolbar),
    .diagram-fullscreen-frame[data-diagram-fullscreen-fallback] :is(.mermaid-toolbar, .drawio-toolbar, .diagram-toolbar) {
      flex: 0 0 auto;
    }
    html.diagram-fullscreen-open,
    html.diagram-fullscreen-open body { overflow: hidden !important; }
  `;
  document.head.append(style);
}

function enhance(frame: HTMLElement) {
  if (frame.hasAttribute("data-diagram-fullscreen-ready")) return;
  frame.setAttribute("data-diagram-fullscreen-ready", "");
  frame.classList.add("diagram-fullscreen-frame");

  let controls = frame.querySelector<HTMLElement>(CONTROLS_SELECTOR);
  const toolbar = frame.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
  if (!controls && toolbar) {
    controls = document.createElement("div");
    controls.className = "diagram-fullscreen-controls";
    toolbar.append(controls);
  }

  const button = document.createElement("button");
  const reference = controls?.querySelector<HTMLButtonElement>("button");
  button.type = "button";
  button.dataset.diagramFullscreen = "";
  button.className = reference?.className || "diagram-fullscreen-floating";
  button.addEventListener("click", () => void toggleFullscreen(frame));
  (controls ?? frame).append(button);
}

function initDiagramFullscreen() {
  ensureStyles();
  document.querySelectorAll<HTMLElement>(FRAME_SELECTOR).forEach(enhance);
  updateButtons();
}

document.addEventListener("fullscreenchange", updateButtons);
document.addEventListener("webkitfullscreenchange", updateButtons);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("[data-diagram-fullscreen-fallback]")) closeFallback();
});
document.addEventListener("astro:page-load", initDiagramFullscreen);
initDiagramFullscreen();
