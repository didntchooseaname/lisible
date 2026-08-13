/**
 * Screen reader announcements through a single polite live region.
 *
 * The region is created on first use, survives within a page, and is dropped
 * on view transitions so every document gets a fresh one. Styling is inline
 * because the element is created at runtime: a class would depend on a
 * utility that the CSS scanner never saw in any template.
 */

let region: HTMLElement | null = null;

function ensureRegion(): HTMLElement {
  if (region?.isConnected) return region;
  const element = document.createElement("p");
  element.setAttribute("role", "status");
  element.style.cssText =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;" +
    "clip-path:inset(50%);white-space:nowrap;border:0";
  document.body.append(element);
  document.addEventListener(
    "astro:before-swap",
    () => {
      region = null;
    },
    { once: true },
  );
  region = element;
  return element;
}

/** Announce a message politely; repeating the same message re-announces it. */
export function announce(message: string): void {
  const element = ensureRegion();
  // Clearing first makes assistive tech treat an identical message as a new
  // update; the timeout keeps the two mutations in separate ticks.
  element.textContent = "";
  window.setTimeout(() => {
    element.textContent = message;
  }, 30);
}
