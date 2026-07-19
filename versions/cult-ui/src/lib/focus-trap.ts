export function createFocusTrap(container: HTMLElement) {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  let previousActiveElement: Element | null = null;

  function getFocusableElements(): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors),
    ).filter(
      (el) =>
        el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden",
    );
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function activate() {
    previousActiveElement = document.activeElement;
    document.addEventListener("keydown", handleKeyDown);
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      requestAnimationFrame(() => focusable[0].focus());
    }
  }

  function deactivate() {
    document.removeEventListener("keydown", handleKeyDown);
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  }

  return { activate, deactivate };
}
