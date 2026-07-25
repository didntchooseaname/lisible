import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { afterAll, afterEach, describe, expect, it } from "bun:test";
import { createFocusTrap, type FocusTrap } from "../../shared/lib/focus-trap";

/**
 * happy-dom limitation: it performs no layout, so HTMLElement.offsetParent is
 * undefined for every element. The module guards with `offsetParent !== null`,
 * and undefined passes that check, so the offsetParent branch filters nothing
 * here and cannot be exercised. Visibility filtering is still covered through
 * getComputedStyle, which happy-dom resolves from inline styles.
 */

let trap: FocusTrap | undefined;

function setup(): HTMLElement {
  document.body.innerHTML = `
    <button id="outside">outside</button>
    <div id="modal">
      <button id="disabled" disabled>disabled</button>
      <span id="negative" tabindex="-1">negative tabindex</span>
      <button id="first">first</button>
      <a id="middle" href="/somewhere">middle</a>
      <input id="last" type="text" />
      <button id="hidden" style="visibility: hidden">hidden</button>
    </div>
  `;
  return document.getElementById("modal") as HTMLElement;
}

function el(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

function pressTab(shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
}

/** The trap focuses its first element inside requestAnimationFrame. */
function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

afterEach(() => {
  trap?.deactivate();
  trap = undefined;
  document.body.innerHTML = "";
});

afterAll(async () => {
  // bun test runs every file in one process: restore the pristine globals.
  await GlobalRegistrator.unregister();
});

describe("createFocusTrap", () => {
  it("focuses the first focusable element on activation, skipping non focusable ones", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();

    // "disabled" and the tabindex -1 span come first in the DOM but are not
    // eligible, so the trap must land on "first".
    expect(document.activeElement?.id).toBe("first");
  });

  it("wraps Tab from the last focusable element back to the first", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();

    // The visibility hidden button sits after the input: if it were not
    // filtered out, the input would not be the boundary and no wrap happened.
    el("last").focus();
    const event = pressTab();

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe("first");
  });

  it("wraps Shift+Tab from the first focusable element to the last", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();

    el("first").focus();
    const event = pressTab(true);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe("last");
  });

  it("leaves Tab alone in the middle of the cycle", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();

    el("middle").focus();
    const event = pressTab();

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement?.id).toBe("middle");
  });

  it("ignores non Tab keys", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();

    el("last").focus();
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement?.id).toBe("last");
  });

  it("restores focus to the previously active element on deactivation", async () => {
    const container = setup();
    el("outside").focus();

    trap = createFocusTrap(container);
    trap.activate();
    await nextFrame();
    expect(document.activeElement?.id).toBe("first");

    trap.deactivate();
    expect(document.activeElement?.id).toBe("outside");
  });

  it("stops intercepting Tab after deactivation", async () => {
    trap = createFocusTrap(setup());
    trap.activate();
    await nextFrame();
    trap.deactivate();

    el("last").focus();
    const event = pressTab();

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement?.id).toBe("last");
  });

  it("does nothing when the container has no focusable element", async () => {
    document.body.innerHTML = '<div id="empty"><p>rien</p></div>';
    trap = createFocusTrap(document.getElementById("empty") as HTMLElement);
    trap.activate();
    await nextFrame();

    const event = pressTab();
    expect(event.defaultPrevented).toBe(false);
  });
});
