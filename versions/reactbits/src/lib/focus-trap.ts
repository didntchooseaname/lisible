const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function createFocusTrap(container: HTMLElement) {
  let previouslyFocused: HTMLElement | null = null;

  function focusable(): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const items = focusable();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      previouslyFocused = document.activeElement as HTMLElement | null;
      document.addEventListener("keydown", onKeydown, true);
      const items = focusable();
      (items[0] ?? container).focus();
    },
    deactivate() {
      document.removeEventListener("keydown", onKeydown, true);
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    },
  };
}
