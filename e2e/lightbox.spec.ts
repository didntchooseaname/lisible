import { expect, test } from "./fixtures";

const insideLightbox = () => {
  const lightbox = document.getElementById("image-lightbox");
  return Boolean(lightbox?.contains(document.activeElement));
};

test("prose image opens the lightbox, traps focus, Escape closes it", async ({ page }) => {
  await page.goto("/blog/demo-fonctionnalites/");

  const image = page.locator("article .prose img[src*='demo-ilots']").first();
  await image.scrollIntoViewIfNeeded();

  const overlay = page.locator("#image-lightbox");

  // The click handlers are attached on astro:page-load; retry the click until
  // the overlay actually opens to avoid racing the script setup.
  await expect(async () => {
    await image.click();
    await expect(overlay).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  // The focus trap moves focus into the overlay on the next animation frame.
  await page.waitForFunction(insideLightbox);

  // Tab must cycle inside the overlay only.
  for (let press = 1; press <= 8; press += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(insideLightbox),
      `Tab press ${press} moved focus outside the lightbox`,
    ).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(overlay).toBeHidden();
});
