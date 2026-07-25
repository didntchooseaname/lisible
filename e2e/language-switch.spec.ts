import { expect, isDark, test } from "./fixtures";
import { langLink, themeToggle } from "./selectors";

test("language switcher navigates FR to EN and back without a full reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  // Pick an explicit theme first so we can assert it survives the switch.
  const initiallyDark = await isDark(page);
  await themeToggle(page).click();
  await expect.poll(() => isDark(page)).toBe(!initiallyDark);

  // A marker on window survives view transitions but not a full page load.
  await page.evaluate(() => {
    (window as Window & { __e2eRealm?: boolean }).__e2eRealm = true;
  });

  await langLink(page, "en").click();
  await page.waitForURL((url) => url.pathname === "/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  expect(
    await page.evaluate(() => (window as Window & { __e2eRealm?: boolean }).__e2eRealm),
    "the FR to EN navigation reloaded the page instead of using a view transition",
  ).toBe(true);
  expect(await isDark(page)).toBe(!initiallyDark);

  await langLink(page, "fr").click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  expect(
    await page.evaluate(() => (window as Window & { __e2eRealm?: boolean }).__e2eRealm),
    "the EN to FR navigation reloaded the page instead of using a view transition",
  ).toBe(true);
  expect(await isDark(page)).toBe(!initiallyDark);
});
