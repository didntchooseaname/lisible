import { copyFileSync, lstatSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const variant = process.argv[2] ?? "organique";
if (process.env.CI !== "true") {
  throw new Error("Deployment links may only be materialized in CI.");
}
if (variant !== "organique") {
  throw new Error(`Unsupported deployment variant: ${variant}`);
}

const root = fileURLToPath(new URL("..", import.meta.url));
const files = [
  ["shared/public/favicon.svg", "public/favicon.svg"],
  ["shared/content/public-images/demo-ilots.svg", "public/images/demo-ilots.svg"],
  ["shared/public/og-default.png", "public/og-default.png"],
  ["shared/routes/about.astro", "src/pages/about.astro"],
  ["shared/routes/blog/[...slug].astro", "src/pages/blog/[...slug].astro"],
  ["shared/routes/blog/index.astro", "src/pages/blog/index.astro"],
  ["shared/routes/en/about.astro", "src/pages/en/about.astro"],
  ["shared/routes/en/blog/[...slug].astro", "src/pages/en/blog/[...slug].astro"],
  ["shared/routes/en/blog/index.astro", "src/pages/en/blog/index.astro"],
  ["shared/routes/en/index.astro", "src/pages/en/index.astro"],
  ["shared/routes/en/rss.xml.ts", "src/pages/en/rss.xml.ts"],
  ["shared/routes/en/tags/index.astro", "src/pages/en/tags/index.astro"],
  ["shared/routes/index.astro", "src/pages/index.astro"],
  ["shared/routes/tags/index.astro", "src/pages/tags/index.astro"],
] as const;

for (const [source, relativeDestination] of files) {
  const destination = join(root, "versions", variant, relativeDestination);
  try {
    lstatSync(destination);
    unlinkSync(destination);
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, source), destination);
}

console.log(`[lisible] ${variant}: materialized ${files.length} shared deployment files.`);
