/**
 * Shared core of the heading anchor copy behavior for the variants whose
 * script ships as an external chunk: cult-ui, reactbits and motion-primitives.
 * The other variants keep their historical forks on purpose: aceternity's
 * script also creates the anchors client side, and _core, h4x0r and organique
 * inline the compiled script into every page, so converging them would change
 * the rendered HTML byte for byte. Labels and icons are always injected by
 * the adapter, never imported here.
 */

export type HeadingAnchorFeedback = (anchor: HTMLAnchorElement) => void;

/** Temporary class on the anchor itself. */
export const classFeedback =
  (className: string, duration: number): HeadingAnchorFeedback =>
  (anchor) => {
    anchor.classList.add(className);
    window.setTimeout(() => anchor.classList.remove(className), duration);
  };

/** Icon swap plus bubble inside the anchor. */
export const swapIconFeedback =
  (options: { icon: string; label: () => string }): HeadingAnchorFeedback =>
  (anchor) => {
    const original = anchor.innerHTML;
    anchor.innerHTML = options.icon;
    anchor.classList.add("is-copied");

    const existing = anchor.querySelector(".heading-anchor-bubble");
    if (existing) existing.remove();
    const bubble = document.createElement("span");
    bubble.className = "heading-anchor-bubble";
    bubble.textContent = options.label();
    bubble.setAttribute("role", "status");
    anchor.appendChild(bubble);
    window.setTimeout(() => bubble.remove(), 1400);

    window.setTimeout(() => {
      anchor.innerHTML = original;
      anchor.classList.remove("is-copied");
    }, 1400);
  };

export interface HeadingAnchorsOptions {
  /** Selector matched from the click target to find the anchor. */
  selector: string;
  /**
   * "module" binds the click listener once at import time, "page-load"
   * rebinds on every astro:page-load, "both" binds now and also rebinds.
   */
  bind: "module" | "page-load" | "both";
  /**
   * Copied URL construction: "page-hash" appends the raw href to origin plus
   * pathname, "resolve" goes through new URL() against the current location.
   */
  urlStyle: "page-hash" | "resolve";
  /**
   * Clipboard strategy: "await-ignore" awaits the write, swallows any error
   * and always completes; "execcommand-fallback" falls back to a hidden
   * textarea with document.execCommand and completes only on success.
   */
  copy: "await-ignore" | "execcommand-fallback";
  /** Only touch the history when the fragment is non empty. */
  historyRequiresHash?: boolean;
  /** Visual feedback, one of the exported factories or a custom one. */
  feedback: HeadingAnchorFeedback;
}

const copyWithExecCommand = (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
  return Promise.resolve();
};

export function setupHeadingAnchors(options: HeadingAnchorsOptions): void {
  const onClick = async (event: MouseEvent): Promise<void> => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>(options.selector);
    if (!anchor) return;
    event.preventDefault();

    const href = anchor.getAttribute("href") ?? "";
    const url =
      options.urlStyle === "page-hash"
        ? `${location.origin}${location.pathname}${href}`
        : new URL(href, window.location.href).toString();

    const done = (): void => {
      if (!options.historyRequiresHash || href) history.replaceState(null, "", href);
      options.feedback(anchor);
    };

    if (options.copy === "await-ignore") {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      done();
    } else {
      copyWithExecCommand(url).then(done);
    }
  };

  const listener = (event: MouseEvent): void => {
    void onClick(event);
  };

  const rebind = (): void => {
    document.removeEventListener("click", listener);
    document.addEventListener("click", listener);
  };

  if (options.bind === "module") {
    document.addEventListener("click", listener);
    return;
  }
  if (options.bind === "both") rebind();
  document.addEventListener("astro:page-load", rebind);
}
