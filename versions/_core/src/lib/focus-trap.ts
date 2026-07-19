const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function createFocusTrap(container: HTMLElement) {
  let previousActive: Element | null = null;

  function focusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden",
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const items = focusable();
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function activate() {
    previousActive = document.activeElement;
    document.addEventListener("keydown", onKeyDown);
    const items = focusable();
    if (items.length > 0) {
      requestAnimationFrame(() => items[0]!.focus());
    }
  }

  function deactivate() {
    document.removeEventListener("keydown", onKeyDown);
    if (previousActive instanceof HTMLElement) previousActive.focus();
  }

  return { activate, deactivate };
}
