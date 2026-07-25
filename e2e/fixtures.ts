import { test as base, expect, type Page } from "@playwright/test";

/**
 * Shared test base for the feature specs.
 *
 * The h4x0r variant plays a one-time boot sequence per browser session. Every
 * feature spec except boot-overlay.spec.ts seeds the session flag so the specs
 * observe the steady state of the page. The flag is a no-op on the other
 * variants. boot-overlay.spec.ts imports the raw @playwright/test instead.
 */
export const test = base.extend<{ seedBootSession: undefined }>({
  seedBootSession: [
    async ({ context }, use) => {
      await context.addInitScript(() => {
        try {
          window.sessionStorage.setItem("cyber-boot", "done");
        } catch {
          // Storage may be unavailable; the overlay then simply plays.
        }
      });
      await use(undefined);
    },
    { auto: true },
  ],
});

export { expect };

/** True when the html element currently carries the dark theme class. */
export function isDark(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.classList.contains("dark"));
}

/** Inline accent custom property applied on the html element. */
export function accentVar(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.style.getPropertyValue("--accent").trim());
}
