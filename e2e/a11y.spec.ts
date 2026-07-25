import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";

const targets = [
  { name: "home", path: "/" },
  { name: "article", path: "/blog/demo-fonctionnalites/" },
  { name: "certifications", path: "/certifications/" },
];

for (const { name, path } of targets) {
  test(`axe reports no critical violation on ${name}`, async ({ page }, testInfo) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).analyze();

    // Serious violations are surfaced for visibility but do not fail the run
    // for now; only critical violations are blocking.
    const serious = results.violations.filter((violation) => violation.impact === "serious");
    for (const violation of serious) {
      console.warn(
        `[axe][${testInfo.project.name}][${name}] serious: ${violation.id} ` +
          `(${violation.nodes.length} node(s)) ${violation.helpUrl}`,
      );
    }

    const critical = results.violations.filter((violation) => violation.impact === "critical");
    expect(
      critical.map((violation) => ({
        id: violation.id,
        help: violation.help,
        nodes: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}
