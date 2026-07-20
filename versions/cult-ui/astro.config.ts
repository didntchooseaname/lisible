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
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import remarkGithubCard from "./src/lib/remark-github-card";
import remarkLinkCard from "./src/lib/remark-link-card";
import { pluginLanguageBadge } from "./src/lib/expressive-code/language-badge";
import { codeTexts } from "./src/i18n/code";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkCallouts from "./src/lib/remark-callouts";
import remarkMermaid from "./src/lib/remark-mermaid";
import remarkDrawio from "./src/lib/remark-drawio";
import rehypeHeadingAnchors from "./src/lib/rehype-heading-anchors";
import { FEATURES, SITE } from "./src/site.config";
import { assertFeatureConfig } from "./src/lib/feature-guards";

assertFeatureConfig();

const remarkPlugins = [remarkDirective];
if (FEATURES.callouts) remarkPlugins.push(remarkCallouts);
if (FEATURES.drawio) remarkPlugins.push(remarkDrawio);
remarkPlugins.push(remarkGithubCard);
if (FEATURES.math) remarkPlugins.push(remarkMath);
if (FEATURES.mermaid) remarkPlugins.push(remarkMermaid);
remarkPlugins.push(remarkLinkCard);

const rehypePlugins = [];
if (FEATURES.headingAnchors)
  rehypePlugins.push(rehypeHeadingIds, rehypeHeadingAnchors);
if (FEATURES.math) rehypePlugins.push(rehypeKatex);
rehypePlugins.push(rehypeTaskCheckboxes);

pluginFramesTexts.overrideTexts("fr", {
  copyButtonTooltip: codeTexts.fr.copy,
  copyButtonCopied: codeTexts.fr.copied,
  terminalWindowFallbackTitle: codeTexts.fr.terminal,
});
pluginFramesTexts.overrideTexts("en", {
  copyButtonTooltip: codeTexts.en.copy,
  copyButtonCopied: codeTexts.en.copied,
  terminalWindowFallbackTitle: codeTexts.en.terminal,
});
pluginCollapsibleSectionsTexts.overrideTexts("fr", {
  collapsedLines: codeTexts.fr.collapsedLines,
});
pluginCollapsibleSectionsTexts.overrideTexts("en", {
  collapsedLines: codeTexts.en.collapsedLines,
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
    react(),
    expressiveCode({
      themes: ["github-dark-default", "github-light"],
      emitExternalStylesheet: false,
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ".dark" : ":root:not(.dark)",
      defaultLocale: "fr",
      getBlockLocale: ({ file }) =>
        file.path?.includes("/content/blog/en/") || file.path?.includes("/pages/en/")
          ? "en"
          : "fr",
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
        codeFontSize: "0.875rem",
        codeLineHeight: "1.65",
        codeBackground: "var(--color-card)",
        uiFontFamily: "var(--font-sans)",
        focusBorder: "var(--color-ring)",
        frames: {
          frameBoxShadowCssValue: "none",
          shadowColor: "transparent",
          editorBackground: "var(--color-card)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-muted-foreground)",
          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBarBackground:
            "color-mix(in oklab, var(--color-secondary) 55%, var(--color-card))",
          editorTabBarBorderBottomColor: "var(--color-border)",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground:
            "color-mix(in oklab, var(--color-secondary) 55%, var(--color-card))",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarDotsForeground: "var(--color-muted-foreground)",
          inlineButtonForeground: "var(--color-muted-foreground)",
          inlineButtonBackground: "var(--color-secondary)",
          inlineButtonBackgroundHoverOrFocusOpacity: "1",
          inlineButtonBackgroundActiveOpacity: "1",
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
      __FEATURE_COMMAND_PALETTE__: JSON.stringify(FEATURES.commandPalette),
      __FEATURE_MERMAID__: JSON.stringify(FEATURES.mermaid),
      __FEATURE_DRAWIO__: JSON.stringify(FEATURES.drawio),
      __FEATURE_HEADING_ANCHORS__: JSON.stringify(FEATURES.headingAnchors),
    },
    preview: {
      allowedHosts: ["3.xsec.fr"],
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
