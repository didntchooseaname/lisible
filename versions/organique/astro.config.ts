import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsTexts,
} from "@expressive-code/plugin-collapsible-sections";
import { pluginFramesTexts } from "@expressive-code/plugin-frames";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import tailwindcss from "@tailwindcss/vite";
import type { RehypePlugins, RemarkPlugins } from "astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { katexAssets } from "../../shared/integrations/katex-assets";
import { rehypeImageDimensions } from "../../shared/markdown/rehype-image-dimensions";
import pagefindDev from "../../shared/pagefind-dev";
import { previewAstroConfig, previewBuildIntegration } from "../../shared/preview/build-config";
import { expressiveCodeTexts } from "./src/i18n/expressive-code";
import rehypeHeadingAnchors from "./src/lib/rehype-heading-anchors";
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import remarkCallouts from "./src/lib/remark-callouts";
import remarkDrawio from "./src/lib/remark-drawio";
import remarkGithubCard from "./src/lib/remark-github-card";
import remarkLinkCard from "./src/lib/remark-link-card";
import remarkMermaid from "./src/lib/remark-mermaid";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import { FEATURES, SITE } from "./src/site.config";

const siteUrl = SITE.url;
const siteHost = new URL(siteUrl).host;
const allowedHosts = [
  siteHost,
  ...(process.env.LISIBLE_ALLOWED_HOSTS?.split(",").filter(Boolean) ?? []),
];

const remarkPlugins: RemarkPlugins = [
  remarkDirective,
  remarkGithubCard,
  remarkLinkCard,
  ...(FEATURES.callouts ? [remarkCallouts] : []),
  ...(FEATURES.drawio ? [remarkDrawio] : []),
  ...(FEATURES.mermaid ? [remarkMermaid] : []),
  ...(FEATURES.math ? [remarkMath] : []),
];

const rehypePlugins: RehypePlugins = [
  rehypeImageDimensions,
  rehypeTaskCheckboxes,
  ...(FEATURES.headingAnchors ? [rehypeHeadingIds, rehypeHeadingAnchors] : []),
  ...(FEATURES.math ? [rehypeKatex] : []),
];

pluginFramesTexts.addLocale("fr", expressiveCodeTexts.frames.fr);
pluginFramesTexts.addLocale("en", expressiveCodeTexts.frames.en);
pluginCollapsibleSectionsTexts.addLocale("fr", expressiveCodeTexts.collapsibleSections.fr);
pluginCollapsibleSectionsTexts.addLocale("en", expressiveCodeTexts.collapsibleSections.en);

export default defineConfig({
  build: {
    // One less render blocking request; the stylesheets are small.
    inlineStylesheets: "always",
  },
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
    katexAssets(FEATURES.math),
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
      __FEATURE_IMAGE_ZOOM__: JSON.stringify(FEATURES.imageZoom),
      __MDX_COMPONENTS_ENABLED__: JSON.stringify(FEATURES.mdxComponents),
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
    processor: unified({ remarkPlugins, rehypePlugins }),
  },
});
