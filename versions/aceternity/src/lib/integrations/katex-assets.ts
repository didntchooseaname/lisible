import type { AstroIntegration } from "astro";
import { createReadStream, existsSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function katexAssets(enabled: boolean): AstroIntegration {
  const require = createRequire(import.meta.url);
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
                    const pathname = (request.url ?? "").split("?", 1)[0];
                    const relativePath = pathname.replace(/^\/+/, "");
                    const filePath = path.resolve(katexDir, relativePath);

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
        const fontsDir = path.join(path.dirname(cssPath), "fonts");
        const outDir = fileURLToPath(new URL("katex/", dir));
        await mkdir(outDir, { recursive: true });
        await cp(cssPath, path.join(outDir, "katex.min.css"));
        await cp(fontsDir, path.join(outDir, "fonts"), { recursive: true });
        logger.info("Self-hosted KaTeX copied to /katex (CSS and fonts).");
      },
    },
  };
}
