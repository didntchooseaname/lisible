import type { AstroIntegration } from "astro";
import { createReadStream, existsSync } from "node:fs";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Serves and emits KaTeX from the installed package instead of committed copies,
 * so the CSS and the fonts can never drift apart from the katex dependency.
 * Only woff2 is shipped: every browser that runs this site supports it, and the
 * legacy woff/ttf files roughly triple the payload.
 */
export function katexAssets(enabled: boolean): AstroIntegration {
  // Resolve from the variant being built, not from shared/, which has no node_modules.
  const require = createRequire(path.resolve(process.cwd(), "package.json"));
  const cssPath = require.resolve("katex/dist/katex.min.css");
  const katexDir = path.dirname(cssPath);

  return {
    name: "katex-assets",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        if (!enabled) return;
        updateConfig({
          vite: {
            plugins: [
              {
                name: "katex-dev-assets",
                configureServer(server) {
                  server.middlewares.use("/katex", (request, response, next) => {
                    const pathname = (request.url ?? "").split("?", 1)[0] ?? "";
                    const filePath = path.resolve(katexDir, pathname.replace(/^\/+/, ""));

                    if (!filePath.startsWith(`${katexDir}${path.sep}`) || !existsSync(filePath)) {
                      next();
                      return;
                    }

                    if (filePath.endsWith(".css")) response.setHeader("Content-Type", "text/css");
                    if (filePath.endsWith(".woff2")) response.setHeader("Content-Type", "font/woff2");
                    createReadStream(filePath).pipe(response);
                  });
                },
              },
            ],
          },
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (!enabled) return;
        const fontsDir = path.join(katexDir, "fonts");
        const outDir = fileURLToPath(new URL("katex/", dir));
        const outFonts = path.join(outDir, "fonts");
        await mkdir(outFonts, { recursive: true });
        await copyFile(cssPath, path.join(outDir, "katex.min.css"));

        const fonts = (await readdir(fontsDir)).filter((file) => file.endsWith(".woff2"));
        await Promise.all(
          fonts.map((file) =>
            copyFile(path.join(fontsDir, file), path.join(outFonts, file)),
          ),
        );
        logger.info(`Self-hosted KaTeX copied to /katex (CSS and ${fonts.length} woff2 fonts).`);
      },
    },
  };
}
