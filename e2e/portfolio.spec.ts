import { expect, test } from "./fixtures";
import { navLink } from "./selectors";

test("certifications page serves the demo data", async ({ page }) => {
  await page.goto("/certifications/");
  await expect(page.getByText("Web Foundations").first()).toBeVisible();
});

test("friends page serves the demo data", async ({ page }) => {
  await page.goto("/friends/");
  await expect(page.getByText("Maya Chen").first()).toBeVisible();
});

test("the EN mirrors of the portfolio pages exist", async ({ page }) => {
  const certifications = await page.request.get("/en/certifications/");
  expect(certifications.status()).toBe(200);
  expect(await certifications.text()).toContain("Web Foundations");

  const friends = await page.request.get("/en/friends/");
  expect(friends.status()).toBe(200);
  expect(await friends.text()).toContain("Maya Chen");
});

test("the header navigation reaches both portfolio pages", async ({ page }) => {
  await page.goto("/");
  await navLink(page, "Certifications").click();
  await page.waitForURL((url) => url.pathname === "/certifications/");
  await expect(page.getByText("Web Foundations").first()).toBeVisible();

  await page.goto("/");
  // FR label of the friends page.
  await navLink(page, "Amis").click();
  await page.waitForURL((url) => url.pathname === "/friends/");
  await expect(page.getByText("Maya Chen").first()).toBeVisible();
});
