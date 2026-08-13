import { expect, isDark, test } from "./fixtures";
import { navLink, themeToggle } from "./selectors";

const preference = (page: Parameters<typeof isDark>[0]) =>
  page.evaluate(() => document.documentElement.dataset.theme ?? "");

const storedTheme = (page: Parameters<typeof isDark>[0]) =>
  page.evaluate(() => localStorage.getItem("theme"));

test("theme toggle cycles light, dark, then back to the system preference", async ({ page }) => {
  // A dark OS preference makes the system state observable: it must differ
  // from the explicit light state that precedes it in the cycle.
  await page.emulateMedia({ colorScheme: "dark" });
  // Init scripts rerun on every document load, so the seed guards itself:
  // only the first load forces the light preference.
  await page.addInitScript(() => {
    if (!localStorage.getItem("__e2e_seeded")) {
      localStorage.setItem("__e2e_seeded", "1");
      localStorage.setItem("theme", "light");
    }
  });
  await page.goto("/");

  await expect.poll(() => preference(page)).toBe("light");
  expect(await isDark(page)).toBe(false);

  // light -> dark
  await themeToggle(page).click();
  await expect.poll(() => preference(page)).toBe("dark");
  expect(await isDark(page)).toBe(true);
  expect(await storedTheme(page)).toBe("dark");

  // dark -> system: the stored override is cleared and the emulated dark
  // scheme resolves the page dark.
  await themeToggle(page).click();
  await expect.poll(() => preference(page)).toBe("system");
  expect(await storedTheme(page)).toBeNull();
  expect(await isDark(page)).toBe(true);

  // system -> light
  await themeToggle(page).click();
  await expect.poll(() => preference(page)).toBe("light");
  expect(await isDark(page)).toBe(false);
});

test("the chosen theme survives reload and soft navigation", async ({ page }) => {
  // Start from an explicit light state so the first click lands on dark, a
  // visible change whatever the OS preference is. The seed guards itself
  // because init scripts rerun on every document load.
  await page.addInitScript(() => {
    if (!localStorage.getItem("__e2e_seeded")) {
      localStorage.setItem("__e2e_seeded", "1");
      localStorage.setItem("theme", "light");
    }
  });
  await page.goto("/");

  await expect.poll(() => isDark(page)).toBe(false);

  await themeToggle(page).click();
  // The class flips inside a view transition callback, so poll instead of
  // asserting synchronously.
  await expect.poll(() => isDark(page)).toBe(true);

  await page.reload();
  await expect.poll(() => isDark(page)).toBe(true);

  // Internal navigation goes through the ClientRouter; the theme must survive
  // the swap as well.
  await navLink(page, "Blog").click();
  await page.waitForURL((url) => url.pathname.startsWith("/blog"));
  await expect.poll(() => isDark(page)).toBe(true);
});
