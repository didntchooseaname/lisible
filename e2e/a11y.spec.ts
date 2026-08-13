import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";
import { searchInput, searchTrigger } from "./selectors";

const knownIssues = JSON.parse(
  readFileSync(new URL("./a11y-known-issues.json", import.meta.url), "utf8"),
) as { issues: KnownIssue[] };

/**
 * Serious and critical axe violations are both blocking. A violation that
 * cannot be fixed right away must be declared in a11y-known-issues.json with
 * a reason, scoped to the exact variant, page, theme and rule it covers, so
 * the accepted debt stays visible and reviewable instead of scrolling by as
 * console noise.
 */

const targets = [
  { name: "home", path: "/" },
  { name: "article", path: "/blog/demo-fonctionnalites/" },
  { name: "certifications", path: "/certifications/" },
  { name: "blog list", path: "/blog/" },
  { name: "tags", path: "/tags/" },
  { name: "archives", path: "/archives/" },
  { name: "not found", path: "/introuvable/" },
];

const themes = ["dark", "light"] as const;

interface KnownIssue {
  variant: string;
  path: string;
  theme: "dark" | "light" | "any";
  ruleId: string;
  reason: string;
}

// The audit measures the steady state: entrance animations otherwise leave
// below-the-fold text at its pre-reveal opacity when axe samples the page.
test.use({ reducedMotion: "reduce" });

const accepted = knownIssues.issues ?? [];

function isAccepted(variant: string, path: string, theme: string, ruleId: string): boolean {
  return accepted.some(
    (issue) =>
      issue.variant === variant &&
      issue.path === path &&
      (issue.theme === "any" || issue.theme === theme) &&
      issue.ruleId === ruleId,
  );
}

async function expectNoBlockingViolations(
  page: import("@playwright/test").Page,
  variant: string,
  path: string,
  theme: string,
): Promise<void> {
  // Several kits run JS driven glyph and entrance animations that reduced
  // motion does not stop, so a single axe sample can catch a mid-animation
  // frame. A violation must survive three samples to block: transient
  // animation states clear on a later attempt, real defects never do.
  let blocking: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"] = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.waitForTimeout(attempt === 0 ? 400 : 700);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    blocking = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .filter((violation) => !isAccepted(variant, path, theme, violation.id));
    if (blocking.length === 0) return;
  }

  expect(
    blocking.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.helpUrl,
      nodes: violation.nodes.slice(0, 8).map((node) => node.target),
    })),
  ).toEqual([]);
}

for (const theme of themes) {
  for (const { name, path } of targets) {
    test(`axe finds no blocking violation on ${name} in ${theme} mode`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.goto(path);
      await expectNoBlockingViolations(page, testInfo.project.name, path, theme);
    });
  }

  test(`axe finds no blocking violation with the palette open in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await page.goto("/");
    await searchTrigger(page).click();
    await expect(searchInput(page)).toBeVisible();
    await expectNoBlockingViolations(page, testInfo.project.name, "/#palette", theme);
  });
}
