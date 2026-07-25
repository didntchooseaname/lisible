import { accentVar, expect, test } from "./fixtures";
import { accentReset, accentTrigger, hueSlider, visibleSliders } from "./selectors";

test("accent picker edits with the keyboard, persists, and resets", async ({ page }) => {
  await page.goto("/");

  const initialAccent = await accentVar(page);
  expect(initialAccent).not.toBe("");

  await accentTrigger(page).click();

  // Both color surfaces are exposed as sliders in the opened popover.
  await expect(visibleSliders(page)).toHaveCount(2);

  // Shift the hue with the keyboard; every variant supports arrow keys on the
  // hue slider and commits the value to localStorage plus the inline CSS var.
  const hue = hueSlider(page);
  await hue.focus();
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press("ArrowRight");
  }

  await expect.poll(() => accentVar(page)).not.toBe(initialAccent);
  const modifiedAccent = await accentVar(page);

  const stored = await page.evaluate(() => localStorage.getItem("accent"));
  expect(stored).toMatch(/^#[0-9a-fA-F]{6}$/);

  // The custom accent must be reapplied on a hard reload.
  await page.reload();
  await expect.poll(() => accentVar(page)).toBe(modifiedAccent);

  // Reset returns to the default accent and clears the stored value.
  await accentTrigger(page).click();
  await expect(visibleSliders(page)).toHaveCount(2);
  await accentReset(page).click();

  await expect.poll(() => accentVar(page)).toBe(initialAccent);
  expect(await page.evaluate(() => localStorage.getItem("accent"))).toBeNull();
});
