// Uses the raw Playwright test on purpose: the shared fixture seeds the
// "cyber-boot" session flag, which would prevent the overlay from playing.
import { expect, test } from "@playwright/test";

test.beforeEach(() => {
  test.skip(
    test.info().project.name !== "h4x0r",
    "the boot overlay only exists in the h4x0r variant",
  );
});

test("the boot overlay plays on first load and the skip button closes it", async ({ page }) => {
  await page.goto("/");

  const overlay = page.locator("[data-boot]");
  await expect(overlay).toBeVisible();

  await overlay.locator("[data-boot-skip]").click();

  // Skipping removes the overlay from the DOM and reveals the page.
  await expect(overlay).toHaveCount(0);
  await expect(page.locator("html")).toHaveClass(/cyber-revealed/);
  expect(await page.evaluate(() => sessionStorage.getItem("cyber-boot"))).toBe("done");
});

test("the boot overlay does not replay once the session flag is set", async ({ page }) => {
  await page.context().addInitScript(() => {
    try {
      window.sessionStorage.setItem("cyber-boot", "done");
    } catch {
      // Storage unavailable; nothing to seed.
    }
  });

  await page.goto("/");

  // The overlay must never become visible, and the script removes it.
  await expect(page.locator("[data-boot]")).toBeHidden();
  await expect(page.locator("[data-boot]")).toHaveCount(0);
});
