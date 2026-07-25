import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsTexts,
} from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import tailwindcss from "@tailwindcss/vite";
import type { RehypePlugins, RemarkPlugins } from "astro";
import { defineConfig } from "astro/config";
import expressiveCode, { pluginFramesTexts } from "astro-expressive-code";
import pagefind from "astro-pagefind";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { katexAssets } from "../../shared/integrations/katex-assets";
import { rehypeImageDimensions } from "../../shared/markdown/rehype-image-dimensions";
import pagefindDev from "../../shared/pagefind-dev";
import { previewAstroConfig, previewBuildIntegration } from "../../shared/preview/build-config";
import { codeUi } from "./src/i18n/code";
import { pluginLanguageBadge } from "./src/lib/expressive-code/language-badge";
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import { remarkCallouts } from "./src/lib/remark-callouts";
import { remarkDrawio } from "./src/lib/remark-drawio";
import { remarkGithubCard } from "./src/lib/remark-github-card";
import { remarkLinkCard } from "./src/lib/remark-link-card";
import { remarkMermaid } from "./src/lib/remark-mermaid";
import { FEATURES, SITE } from "./src/site.config";

const siteHost = new URL(SITE.url).host;
const allowedHosts = [
  siteHost,
  ...(process.env.LISIBLE_ALLOWED_HOSTS?.split(",").filter(Boolean) ?? []),
];

const remarkPlugins: RemarkPlugins = [
  ...(FEATURES.math ? [remarkMath] : []),
  remarkDirective,
  ...(FEATURES.callouts ? [remarkCallouts] : []),
  ...(FEATURES.drawio ? [remarkDrawio] : []),
  remarkGithubCard,
  ...(FEATURES.mermaid ? [remarkMermaid] : []),
  remarkLinkCard,
];

const rehypePlugins: RehypePlugins = [
  rehypeImageDimensions,
  rehypeTaskCheckboxes,
  ...(FEATURES.math ? [rehypeKatex] : []),
];

pluginFramesTexts.addLocale("fr", {
  copyButtonTooltip: codeUi.fr.copy,
  copyButtonCopied: codeUi.fr.copied,
  terminalWindowFallbackTitle: codeUi.fr.terminalTitle,
});
pluginFramesTexts.overrideTexts("en", {
  copyButtonTooltip: codeUi.en.copy,
  copyButtonCopied: codeUi.en.copied,
  terminalWindowFallbackTitle: codeUi.en.terminalTitle,
});
pluginCollapsibleSectionsTexts.addLocale("fr", {
  collapsedLines: codeUi.fr.collapsedLines,
});
pluginCollapsibleSectionsTexts.overrideTexts("en", {
  collapsedLines: codeUi.en.collapsedLines,
});

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
    expressiveCode({
      themes: ["github-dark", "github-light"],
      emitExternalStylesheet: false,
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
      defaultLocale: "fr",
      getBlockLocale: ({ file }) =>
        file.path?.replace(/\\/g, "/").includes("/blog/en/") ? "en" : "fr",
      plugins: [pluginCollapsibleSections(), pluginLineNumbers(), pluginLanguageBadge()],
      defaultProps: {
        wrap: true,
        collapseStyle: "collapsible-auto",
        overridesByLang: {
          "ansi,bash,bat,batch,cmd,console,diff,plaintext,powershell,ps,ps1,sh,shell,shellscript,shellsession,text,txt,zsh":
            {
              showLineNumbers: false,
            },
        },
      },
      styleOverrides: {
        borderColor: "var(--color-border)",
        borderWidth: "1px",
        borderRadius: "var(--radius)",
        codeFontFamily: "var(--font-mono)",
        uiFontFamily: "var(--font-sans)",
        codeFontSize: "0.875rem",
        codeBackground: "var(--color-card)",
        frames: {
          frameBoxShadowCssValue: "none",
          editorTabBarBackground: "color-mix(in oklab, var(--color-muted) 40%, var(--color-card))",
          editorTabBarBorderBottomColor: "var(--color-border)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-muted-foreground)",
          editorActiveTabIndicatorTopColor: "transparent",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBorderRadius: "0",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground:
            "color-mix(in oklab, var(--color-muted) 40%, var(--color-card))",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
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
    katexAssets(FEATURES.math),
    sitemap({
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
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "mermaid",
      ],
    },
    define: {
      __F_IMAGEZOOM__: JSON.stringify(FEATURES.imageZoom),
      __F_HEADINGANCHORS__: JSON.stringify(FEATURES.headingAnchors),
      __F_MERMAID__: JSON.stringify(FEATURES.mermaid),
      __F_DRAWIO__: JSON.stringify(FEATURES.drawio),
    },
    preview: {
      allowedHosts,
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins,
      rehypePlugins,
    }),
  },
});
