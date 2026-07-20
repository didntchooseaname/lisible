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
import { rehypeHeadingAnchors } from "./src/lib/rehype-heading-anchors";
import remarkGithubCard from "./src/lib/remark-github-card";
import remarkLinkCard from "./src/lib/remark-link-card";
import remarkCallouts from "./src/lib/remark-callouts";
import remarkMermaid from "./src/lib/remark-mermaid";
import remarkDrawio from "./src/lib/remark-drawio";
import { pluginLanguageBadge } from "./src/lib/expressive-code-language-badge";
import { locales, ui } from "./src/i18n/ui";
import { FEATURES, SITE } from "./src/site.config";
import { assertFeatureConfig } from "./src/lib/config-guards";

const featureConfigGuard = {
  name: "feature-config-guard",
  hooks: {
    "astro:config:setup": () => assertFeatureConfig(),
  },
};

const remarkPlugins = [
  remarkDirective,
  ...(FEATURES.callouts ? [remarkCallouts] : []),
  ...(FEATURES.drawio ? [remarkDrawio] : []),
  remarkGithubCard,
  ...(FEATURES.mermaid ? [remarkMermaid] : []),
  remarkLinkCard,
  ...(FEATURES.math ? [remarkMath] : []),
];

const rehypePlugins = [
  rehypeTaskCheckboxes,
  ...(FEATURES.headingAnchors ? [rehypeHeadingIds, rehypeHeadingAnchors] : []),
  ...(FEATURES.math ? [rehypeKatex] : []),
];

for (const locale of locales) {
  pluginFramesTexts.overrideTexts(locale, {
    copyButtonTooltip: ui[locale].code.copy,
    copyButtonCopied: ui[locale].code.copied,
    terminalWindowFallbackTitle: ui[locale].code.terminal,
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
    featureConfigGuard,
    expressiveCode({
      themes: ["github-dark", "github-light"],
      emitExternalStylesheet: false,
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ".dark" : ":root:not(.dark)",
      defaultLocale: "fr",
      getBlockLocale: ({ file }) =>
        /\/(?:blog\/)?en\//.test(file.path ?? "") ? "en" : "fr",
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
          "bash,ansi,text,txt,diff,sh,shell,shellscript,shellsession,zsh,console":
            {
              showLineNumbers: false,
            },
        },
      },
      styleOverrides: {
        borderColor: "var(--color-border)",
        borderRadius: "var(--radius)",
        borderWidth: "1px",
        codeBackground: "var(--color-card)",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.875rem",
        codeLineHeight: "1.65",
        uiFontFamily: "var(--font-sans)",
        focusBorder: "var(--color-ring)",
        frames: {
          frameBoxShadowCssValue: "none",
          editorTabBarBackground:
            "color-mix(in oklab, var(--color-muted) 40%, transparent)",
          editorTabBarBorderBottomColor: "var(--color-border)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-muted-foreground)",
          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBorderRadius: "var(--radius-sm, calc(var(--radius) - 4px))",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground:
            "color-mix(in oklab, var(--color-muted) 40%, transparent)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsOpacity: "0.4",
          inlineButtonBackground: "var(--color-secondary)",
          inlineButtonBackgroundIdleOpacity: "0",
          inlineButtonBackgroundHoverOrFocusOpacity: "1",
          inlineButtonBackgroundActiveOpacity: "1",
          inlineButtonForeground: "var(--color-muted-foreground)",
          inlineButtonBorder: "var(--color-border)",
          inlineButtonBorderOpacity: "1",
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
  ],
  vite: {
    plugins: [pagefindDev(), tailwindcss()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "mermaid"],
    },
    define: {
      __FEATURE_HEADING_ANCHORS__: JSON.stringify(FEATURES.headingAnchors),
      __FEATURE_MERMAID__: JSON.stringify(FEATURES.mermaid),
      __FEATURE_DRAWIO__: JSON.stringify(FEATURES.drawio),
      __FEATURE_IMAGE_ZOOM__: JSON.stringify(FEATURES.imageZoom),
    },
    preview: {
      allowedHosts: ["5.xsec.fr"],
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
