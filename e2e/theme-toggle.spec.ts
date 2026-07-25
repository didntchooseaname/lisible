import { expect, isDark, test } from "./fixtures";
import { navLink, themeToggle } from "./selectors";

test("theme toggle flips the dark class and survives reload and soft navigation", async ({
  page,
}) => {
  await page.goto("/");

  const initiallyDark = await isDark(page);

  await themeToggle(page).click();
  // The class flips inside a view transition callback, so poll instead of
  // asserting synchronously.
  await expect.poll(() => isDark(page)).toBe(!initiallyDark);

  await page.reload();
  await expect.poll(() => isDark(page)).toBe(!initiallyDark);

  // Internal navigation goes through the ClientRouter; the theme must survive
  // the swap as well.
  await navLink(page, "Blog").click();
  await page.waitForURL((url) => url.pathname.startsWith("/blog"));
  await expect.poll(() => isDark(page)).toBe(!initiallyDark);
});
