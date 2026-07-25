import { expect, test } from "./fixtures";
import { searchInput, searchModal, searchTrigger } from "./selectors";

test("Ctrl+K opens the search palette, Escape closes it and restores focus", async ({ page }) => {
  await page.goto("/");

  const trigger = searchTrigger(page);
  await trigger.focus();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("ControlOrMeta+k");

  const modal = searchModal(page);
  await expect(modal).toBeVisible();
  await expect(searchInput(page)).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();

  // Closing the native dialog gives focus back to the previously focused
  // element, which is the trigger here.
  await expect(trigger).toBeFocused();
});
