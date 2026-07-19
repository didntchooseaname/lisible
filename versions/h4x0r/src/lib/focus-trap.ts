
export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
}

export function createFocusTrap(container: HTMLElement): FocusTrap {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  let previousActive: Element | null = null;

  function focusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
      (el) => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden",
    );
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const elements = focusable();
    if (elements.length === 0) return;
    const first = elements[0];
    const last = elements[elements.length - 1];

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

  return {
    activate() {
      previousActive = document.activeElement;
      document.addEventListener("keydown", onKeydown);
      requestAnimationFrame(() => {
        focusable()[0]?.focus();
      });
    },
    deactivate() {
      document.removeEventListener("keydown", onKeydown);
      if (previousActive instanceof HTMLElement) previousActive.focus();
    },
  };
}
