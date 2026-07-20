import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import pagefindDev from "../../shared/pagefind-dev";
import { previewAstroConfig, previewBuildIntegration } from "../../shared/preview/build-config";
import tailwindcss from "@tailwindcss/vite";
import remarkDirective from "remark-directive";
import expressiveCode, { pluginFramesTexts } from "astro-expressive-code";
import {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsTexts,
} from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import remarkGithubCard from "./src/plugins/remark-github-card";
import remarkLinkCard from "./src/plugins/remark-link-card";
import remarkCallouts from "./src/plugins/remark-callouts";
import remarkMermaid from "./src/plugins/remark-mermaid";
import remarkDrawio from "./src/plugins/remark-drawio";
import remarkMathFlag from "./src/plugins/remark-math-flag";
import rehypeHeadingAnchors from "./src/plugins/rehype-heading-anchors";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import { ui } from "./src/i18n/ui";
import { FEATURES, SITE } from "./src/site.config";

const remarkPlugins = [
  remarkDirective,
  remarkGithubCard,
  remarkLinkCard,
  ...(FEATURES.callouts ? [remarkCallouts] : []),
  ...(FEATURES.drawio ? [remarkDrawio] : []),
  ...(FEATURES.mermaid ? [remarkMermaid] : []),
  ...(FEATURES.math ? [remarkMath, remarkMathFlag] : []),
];

const rehypePlugins = [
  rehypeTaskCheckboxes,
  ...(FEATURES.math ? [rehypeKatex] : []),
  ...(FEATURES.headingAnchors ? [rehypeHeadingIds, rehypeHeadingAnchors] : []),
];

for (const locale of ["fr", "en"] as const) {
  pluginFramesTexts.overrideTexts(locale, {
    copyButtonTooltip: ui[locale].code.copy,
    copyButtonCopied: ui[locale].code.copied,
  });
  pluginCollapsibleSectionsTexts.overrideTexts(locale, {
    collapsedLines: ui[locale].code.collapsedLines,
  });
}

export default defineConfig({
  ...previewAstroConfig(),
  devToolbar: { enabled: false },
  site: SITE.url,
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
    react(),
    expressiveCode({
      themes: ["github-dark-default", "github-light-default"],
      emitExternalStylesheet: false,
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ".dark" : ":root:not(.dark)",
      defaultLocale: "fr",
      getBlockLocale: ({ file }) =>
        /[\\/](?:blog[\\/]en|pages[\\/]en)[\\/]/.test(file.path ?? "") ? "en" : "fr",
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginLanguageBadge(),
      ],
      defaultProps: {
        wrap: true,
        collapseStyle: "collapsible-auto",
        showLineNumbers: true,
        overridesByLang: {
          "ansi,bash,console,diff,sh,shell,shellscript,shellsession,text,txt,zsh": {
            showLineNumbers: false,
          },
        },
      },
      styleOverrides: {
        codeFontSize: "0.875rem",
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius)",
        codeFontFamily: "var(--font-mono)",
        uiFontFamily: "var(--font-sans)",
        codeBackground: "var(--color-card)",
        focusBorder: "var(--color-ring)",
        frames: {
          frameBoxShadowCssValue: "none",
          editorBackground: "var(--color-card)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-foreground)",
          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBarBackground: "var(--color-muted)",
          editorTabBarBorderBottomColor: "var(--color-border)",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground: "var(--color-muted)",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarDotsForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsOpacity: "0.4",
          inlineButtonBackground: "var(--color-secondary)",
          inlineButtonBorder: "var(--color-border)",
          inlineButtonForeground: "var(--color-muted-foreground)",
          copyIcon:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='14' height='14' x='8' y='8' rx='2' ry='2'/%3E%3Cpath d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/%3E%3C/svg%3E\")",
          tooltipSuccessBackground: "var(--color-popover)",
          tooltipSuccessForeground: "var(--color-foreground)",
        },
        lineNumbers: {
          foreground: "var(--color-muted-foreground)",
        },
        textMarkers: {
          lineMarkerLabelColor: "var(--color-foreground)",
        },
      },
    }),
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
  ],
  vite: {
    plugins: [pagefindDev(), tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "mermaid"],
    },
    define: {
      __FEATURE_IMAGE_ZOOM__: JSON.stringify(FEATURES.imageZoom),
      __FEATURE_MERMAID__: JSON.stringify(FEATURES.mermaid),
      __FEATURE_DRAWIO__: JSON.stringify(FEATURES.drawio),
      __FEATURE_HEADING_ANCHORS__: JSON.stringify(FEATURES.headingAnchors),
    },
    preview: {
      allowedHosts: ["blog.example.com"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 0,
      rollupOptions: {
        external: ["/pagefind/pagefind.js"],
      },
    },
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({ remarkPlugins, rehypePlugins }),
  },
});
