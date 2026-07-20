import { fileURLToPath } from "node:url";
import path from "node:path";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createReadStream } from "node:fs";
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import pagefindDev from "../../shared/pagefind-dev";
import { previewAstroConfig, previewBuildIntegration } from "../../shared/preview/build-config";
import tailwindcss from "@tailwindcss/vite";
import remarkDirective from "remark-directive";
import expressiveCode from "astro-expressive-code";
import {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsTexts,
} from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginFramesTexts } from "@expressive-code/plugin-frames";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import remarkGithubCard from "./src/lib/remark-github-card";
import remarkLinkCard from "./src/lib/remark-link-card";
import remarkCallouts from "./src/lib/remark-callouts";
import remarkMermaid from "./src/lib/remark-mermaid";
import remarkDrawio from "./src/lib/remark-drawio";
import rehypeHeadingAnchors from "./src/lib/rehype-heading-anchors";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import { expressiveCodeTexts } from "./src/i18n/expressive-code";
import { FEATURES, SITE } from "./src/site.config";

const siteUrl = SITE.url;
const siteHost = new URL(siteUrl).host;

const remarkPlugins = [
  remarkDirective,
  remarkGithubCard,
  remarkLinkCard,
  ...(FEATURES.callouts ? [remarkCallouts] : []),
  ...(FEATURES.drawio ? [remarkDrawio] : []),
  ...(FEATURES.mermaid ? [remarkMermaid] : []),
  ...(FEATURES.math ? [remarkMath] : []),
];

const rehypePlugins = [
  rehypeTaskCheckboxes,
  ...(FEATURES.headingAnchors ? [rehypeHeadingIds, rehypeHeadingAnchors] : []),
  ...(FEATURES.math ? [rehypeKatex] : []),
];

function katexAssets(): AstroIntegration {
  const katexDir = path.resolve("node_modules/katex/dist");
  return {
    name: "katex-assets",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        if (!FEATURES.math) return;
        updateConfig({
          vite: {
            plugins: [
              {
                name: "katex-dev-serve",
                configureServer(server: { middlewares: { use: (path: string, fn: (req: { url?: string }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => void) => void } }) {
                  server.middlewares.use("/katex", (req, res, next) => {
                    const rel = (req.url ?? "").split("?")[0] ?? "";
                    const file = path.join(katexDir, rel);
                    if (!file.startsWith(katexDir) || !existsSync(file)) return next();
                    if (file.endsWith(".css")) res.setHeader("Content-Type", "text/css");
                    if (file.endsWith(".woff2")) res.setHeader("Content-Type", "font/woff2");
                    createReadStream(file).pipe(res as unknown as NodeJS.WritableStream);
                  });
                },
              },
            ],
          },
        });
      },
      "astro:build:done": ({ dir }) => {
        if (!FEATURES.math) return;
        const out = path.join(fileURLToPath(dir), "katex");
        mkdirSync(out, { recursive: true });
        cpSync(path.join(katexDir, "katex.min.css"), path.join(out, "katex.min.css"));
        cpSync(path.join(katexDir, "fonts"), path.join(out, "fonts"), { recursive: true });
      },
    },
  };
}

pluginFramesTexts.addLocale("fr", expressiveCodeTexts.frames.fr);
pluginFramesTexts.addLocale("en", expressiveCodeTexts.frames.en);
pluginCollapsibleSectionsTexts.addLocale("fr", expressiveCodeTexts.collapsibleSections.fr);
pluginCollapsibleSectionsTexts.addLocale("en", expressiveCodeTexts.collapsibleSections.en);

export default defineConfig({
  ...previewAstroConfig(),
  devToolbar: { enabled: false },
  site: siteUrl,
  output: "static",
  i18n: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    expressiveCode({
      themes: ["github-dark", "github-light"],
      useDarkModeMediaQuery: false,
      emitExternalStylesheet: false,
      themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
      getBlockLocale: ({ file }) => (/[\\/]en[\\/]/.test(file.path ?? "") ? "en" : "fr"),
      plugins: [pluginCollapsibleSections(), pluginLineNumbers(), pluginLanguageBadge()],
      defaultProps: {
        wrap: true,
        collapseStyle: "collapsible-auto",
        showLineNumbers: true,
        overridesByLang: {
          "ansi,bash,bat,batch,cmd,console,diff,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,txt,zsh":
            {
              showLineNumbers: false,
            },
        },
      },
      styleOverrides: {
        borderColor: "var(--color-border)",
        borderWidth: "1px",
        borderRadius: "var(--radius)",
        codeBackground: "var(--color-card)",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.875rem",
        codeLineHeight: "1.65",
        codePaddingBlock: "1rem",
        codePaddingInline: "1.25rem",
        uiFontFamily: "var(--font-sans)",
        focusBorder: "var(--color-ring)",
        frames: {
          frameBoxShadowCssValue: "none",
          editorTabBarBackground: "var(--color-secondary)",
          editorTabBarBorderBottomColor: "var(--color-border)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-muted-foreground)",
          editorActiveTabBorderColor: "var(--color-border)",
          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground: "var(--color-secondary)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsOpacity: "0.45",
          inlineButtonForeground: "var(--color-muted-foreground)",
          inlineButtonBorder: "var(--color-border)",
          inlineButtonBorderOpacity: "1",
          inlineButtonBackground: "var(--color-secondary)",
          inlineButtonBackgroundIdleOpacity: "0",
          inlineButtonBackgroundHoverOrFocusOpacity: "1",
          inlineButtonBackgroundActiveOpacity: "1",
          copyIcon:
            "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2024%2024'%20fill%3D'none'%20stroke%3D'black'%20stroke-width%3D'1.5'%20stroke-linecap%3D'round'%20stroke-linejoin%3D'round'%3E%3Crect%20width%3D'14'%20height%3D'14'%20x%3D'8'%20y%3D'8'%20rx%3D'2'%20ry%3D'2'%2F%3E%3Cpath%20d%3D'M4%2016c-1.1%200-2-.9-2-2V4c0-1.1.9-2%202-2h10c1.1%200%202%20.9%202%202'%2F%3E%3C%2Fsvg%3E\")",
          tooltipSuccessBackground: "var(--color-popover)",
          tooltipSuccessForeground: "var(--color-foreground)",
        },
        lineNumbers: {
          foreground: "var(--color-muted-foreground)",
        },
      },
    }),
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith("/landing/french/"),
      i18n: {
        defaultLocale: "fr",
        locales: {
          fr: "fr-FR",
          en: "en-US",
        },
      },
    }),
    pagefind(),
    previewBuildIntegration(),
    katexAssets(),
  ],
  vite: {
    plugins: [pagefindDev(), tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "mermaid"],
    },
    define: {
      __FEATURE_IMAGE_ZOOM__: JSON.stringify(FEATURES.imageZoom),
    },
    preview: {
      allowedHosts: [siteHost],
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({ remarkPlugins, rehypePlugins }),
  },
});
