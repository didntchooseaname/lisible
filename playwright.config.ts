import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { VARIANTS } from "./shared/variants";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// Two representative variants by default: one kit-free layout (organique) and
// the MagicUI cyber theme (h4x0r). E2E_VARIANTS=all widens to the six public
// variants, E2E_VARIANTS=a,b,c selects an explicit list.
const DEFAULT_IDS = ["organique", "h4x0r"];

function selectedIds(): string[] {
  const raw = process.env.E2E_VARIANTS?.trim();
  if (!raw) return DEFAULT_IDS;
  if (raw === "all") return VARIANTS.map((variant) => variant.id);
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

const ids = selectedIds();
const unknown = ids.filter((id) => !VARIANTS.some((variant) => variant.id === id));
if (unknown.length > 0) {
  throw new Error(
    `Unknown variant(s) in E2E_VARIANTS: ${unknown.join(", ")}. ` +
      `Valid ids: ${VARIANTS.map((variant) => variant.id).join(", ")}`,
  );
}
const selected = VARIANTS.filter((variant) => ids.includes(variant.id));

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  // One Chromium project per variant, named after the variant id so specs can
  // branch on test.info().project.name when a feature is variant specific.
  projects: selected.map(({ id, port }) => ({
    name: id,
    use: {
      ...devices["Desktop Chrome"],
      baseURL: `http://localhost:${port}`,
    },
  })),
  // Same invocation as scripts/preview-all.ts: `bunx astro preview --port N`
  // from the variant directory, serving the prebuilt dist/.
  webServer: selected.map(({ id, port }) => ({
    command: `bunx astro preview --port ${port}`,
    cwd: `${rootDir}versions/${id}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
