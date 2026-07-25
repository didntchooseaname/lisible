import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { homeLink, MERMAID_BLOCK, MERMAID_SVG } from "./selectors";

// Rendering is lazy (IntersectionObserver, re-armed on astro:page-load) and
// the mermaid bundle is imported on demand, so under parallel load the first
// scroll can land while the view transition swap is still settling. Re-scroll
// on every retry until the SVG shows up.
async function expectRenderedDiagram(page: Page): Promise<void> {
  const block = page.locator(MERMAID_BLOCK).first();
  await expect(async () => {
    await block.scrollIntoViewIfNeeded();
    await expect(block.locator(MERMAID_SVG)).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 30_000 });
}

test("mermaid renders an SVG, and again after a soft navigation round trip", async ({ page }) => {
  // Two lazy renders plus a navigation round trip do not fit the default
  // budget when all six variants run in parallel on one machine.
  test.setTimeout(90_000);

  await page.goto("/blog/demo-fonctionnalites/");
  await expectRenderedDiagram(page);

  // Sanity check that the SVG holds actual diagram geometry.
  const svg = page.locator(MERMAID_BLOCK).first().locator(MERMAID_SVG);
  expect(await svg.locator("g").count()).toBeGreaterThan(0);

  // Soft navigation to the home page, then back to the article. The home page
  // has no diagram block, so waiting for the count to drop to zero proves the
  // swap completed before we navigate back.
  await homeLink(page).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.locator(MERMAID_BLOCK)).toHaveCount(0);

  await page.goBack();
  await page.waitForURL((url) => url.pathname === "/blog/demo-fonctionnalites/");
  await expectRenderedDiagram(page);
});
