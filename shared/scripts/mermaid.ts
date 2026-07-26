/**
 * Shared core of the mermaid client runtime. The lazy loading, the source
 * decoding, the render queue, the IntersectionObserver gating, the theme
 * MutationObserver and the re render cycle live here; every variant keeps its
 * exact markup hooks, mermaid theme, pan zoom wiring, copy button and error
 * handling through options. The mermaid package itself is injected by the
 * adapter so each variant resolves its own dependency. h4x0r keeps its own
 * runtime: its observation model, block level source attribute and controls
 * cache share too little with this skeleton.
 */

export interface MermaidLike {
  initialize(config: Record<string, unknown>): void;
  render(id: string, code: string): Promise<{ svg: string }>;
}

export interface MermaidRenderParts {
  container: HTMLElement;
  renderTarget: HTMLElement;
  code: string;
}

export interface MermaidThemeOptions {
  /** Delay before re rendering after a theme mutation; immediate if absent. */
  debounce?: number;
  /** Observed attributes on the html element. */
  attributeFilter?: string[];
  /** Only re render when the dark class actually flipped (reactbits). */
  onlyOnDarkChange?: boolean;
  /** Recreate the observer on every page load instead of once at startup. */
  reconnect?: boolean;
}

export interface MermaidClientOptions {
  /** Loader of the variant's own mermaid dependency. */
  load: () => Promise<MermaidLike>;
  /** Container selector of the variant markup. */
  selector: string;
  /** Attribute marking an already rendered container. */
  renderedAttr?: string;
  /** Selectors that must resolve inside the container before rendering. */
  requires?: string[];
  /** Encoded source lookup; default reads the data-mermaid-source child. */
  source?: (container: HTMLElement) => string | null;
  /** mermaid.initialize configuration; startOnLoad false is added here. */
  config: () => Record<string, unknown>;
  /** Diagram id, without the -svg suffix appended by the core. */
  diagramId: (container: HTMLElement) => string;
  /** Called on every renderAll pass before observing (cult-ui hides the
   * fallback of pending containers). */
  beforeObserve?: (container: HTMLElement) => void;
  /** Inside the try, right after a successful first render. */
  onSuccess?: (parts: MermaidRenderParts) => void;
  /** Error branch of the first render; the loading element is already hidden. */
  onError: (container: HTMLElement, error: unknown) => void;
  /** After a successful first render: pan zoom and copy wiring. */
  onRendered?: (parts: MermaidRenderParts) => void;
  /** After each successful theme re render (cult-ui refits the viewport). */
  onReRendered?: (container: HTMLElement) => void;
  /** Re render error handling; silent when omitted (organique). */
  onReRenderError?: (error: unknown) => void;
  theme?: MermaidThemeOptions;
  /** eager renders at module load, pageload waits for astro:page-load, ready
   * additionally starts when the document is already parsed (reactbits). */
  startup: "eager" | "pageload" | "ready";
}

export function createMermaidClient(options: MermaidClientOptions): void {
  const renderedAttr = options.renderedAttr ?? "data-mermaid-rendered";
  const themeOptions = options.theme ?? {};

  let mermaidPromise: Promise<MermaidLike> | null = null;
  let renderQueue = Promise.resolve();

  function loadMermaid(): Promise<MermaidLike> {
    mermaidPromise ??= options.load();
    return mermaidPromise;
  }

  function decode(encoded: string): string {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function getSource(container: HTMLElement): string | null {
    if (options.source) return options.source(container);
    const sourceEl = container.querySelector<HTMLElement>("[data-mermaid-source]");
    return sourceEl ? sourceEl.getAttribute("data-mermaid-source") || "" : null;
  }

  function prepareSvg(svgEl: SVGSVGElement) {
    const viewBox = svgEl.viewBox.baseVal;
    if (viewBox?.width && viewBox?.height) {
      svgEl.setAttribute("width", `${viewBox.width}`);
      svgEl.setAttribute("height", `${viewBox.height}`);
    }
    svgEl.style.display = "block";
    svgEl.style.maxWidth = "none";
    svgEl.style.maxHeight = "none";
  }

  async function initMermaid(): Promise<MermaidLike> {
    const mermaid = await loadMermaid();
    mermaid.initialize({ startOnLoad: false, ...options.config() });
    return mermaid;
  }

  async function renderInto(container: HTMLElement, target: HTMLElement, code: string) {
    const mermaid = await initMermaid();
    const svgId = `${options.diagramId(container)}-svg`;
    document.getElementById(svgId)?.remove();
    const { svg } = await mermaid.render(svgId, code);
    target.innerHTML = svg;
    const svgEl = target.querySelector<SVGSVGElement>("svg");
    if (svgEl) prepareSvg(svgEl);
  }

  async function renderDiagram(container: HTMLElement) {
    const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
    if (!renderTarget) return;
    for (const required of options.requires ?? []) {
      if (!container.querySelector(required)) return;
    }
    const encoded = getSource(container);
    if (encoded == null) return;
    const code = decode(encoded);
    if (!code) return;

    const loading = container.querySelector<HTMLElement>("[data-mermaid-loading]");
    const parts: MermaidRenderParts = { container, renderTarget, code };

    try {
      await renderInto(container, renderTarget, code);
      if (loading) loading.style.display = "none";
      options.onSuccess?.(parts);
    } catch (error) {
      if (loading) loading.style.display = "none";
      options.onError(container, error);
      return;
    }

    options.onRendered?.(parts);
  }

  function queueRender(container: HTMLElement) {
    if (container.hasAttribute(renderedAttr)) return;
    container.setAttribute(renderedAttr, "");
    renderQueue = renderQueue.then(() => renderDiagram(container));
  }

  function renderWhenVisible(container: HTMLElement) {
    if (container.hasAttribute(renderedAttr) || container.hasAttribute("data-mermaid-observed"))
      return;
    if (!("IntersectionObserver" in window)) {
      queueRender(container);
      return;
    }
    container.setAttribute("data-mermaid-observed", "");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        container.removeAttribute("data-mermaid-observed");
        queueRender(container);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(container);
  }

  function renderAll() {
    document.querySelectorAll<HTMLElement>(options.selector).forEach((container) => {
      options.beforeObserve?.(container);
      renderWhenVisible(container);
    });
  }

  async function reRenderAll() {
    const containers = document.querySelectorAll<HTMLElement>(
      `${options.selector}[${renderedAttr}]`,
    );
    for (const container of containers) {
      const renderTarget = container.querySelector<HTMLElement>("[data-mermaid-render]");
      if (!renderTarget) continue;
      const encoded = getSource(container);
      if (encoded == null) continue;
      const code = decode(encoded);
      if (!code) continue;
      try {
        await renderInto(container, renderTarget, code);
        options.onReRendered?.(container);
      } catch (error) {
        options.onReRenderError?.(error);
      }
    }
  }

  function isDark(): boolean {
    return document.documentElement.classList.contains("dark");
  }

  let themeTimer: number | null = null;
  let themeObserver: MutationObserver | null = null;
  let lastDark = false;

  function handleThemeMutation() {
    if (themeOptions.onlyOnDarkChange) {
      if (isDark() === lastDark) return;
      lastDark = isDark();
    }
    if (themeOptions.debounce != null) {
      if (themeTimer !== null) window.clearTimeout(themeTimer);
      themeTimer = window.setTimeout(() => {
        themeTimer = null;
        void reRenderAll();
      }, themeOptions.debounce);
    } else {
      void reRenderAll();
    }
  }

  function connectThemeObserver() {
    themeObserver?.disconnect();
    lastDark = isDark();
    themeObserver = new MutationObserver(handleThemeMutation);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: themeOptions.attributeFilter ?? ["class"],
    });
  }

  function start() {
    renderAll();
    if (themeOptions.reconnect) connectThemeObserver();
  }

  if (!themeOptions.reconnect) connectThemeObserver();
  if (options.startup === "eager") renderAll();
  document.addEventListener("astro:page-load", start);
  if (options.startup === "ready" && document.readyState !== "loading") start();
}
