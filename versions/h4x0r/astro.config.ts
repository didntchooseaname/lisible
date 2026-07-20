import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import pagefindDev from "../../shared/pagefind-dev";
import { previewAstroConfig, previewBuildIntegration } from "../../shared/preview/build-config";
import tailwindcss from "@tailwindcss/vite";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import expressiveCode, { pluginFramesTexts } from "astro-expressive-code";
import {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsTexts,
} from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { rehypeTaskCheckboxes } from "./src/lib/rehype-task-checkboxes";
import remarkGithubCard from "./src/lib/remark-github-card";
import remarkLinkCard from "./src/lib/remark-link-card";
import remarkCallouts from "./src/lib/remark-callouts";
import remarkMermaid from "./src/lib/remark-mermaid";
import remarkDrawio from "./src/lib/remark-drawio";
import rehypeHeadingAnchors from "./src/lib/rehype-heading-anchors";
import { pluginLanguageBadge } from "./src/lib/expressive-code/language-badge";
import { codeStrings } from "./src/i18n/code";
import { COMMENTS, FEATURES, SITE, WEBMENTIONS } from "./src/site.config";

if (FEATURES.webmentions && !WEBMENTIONS.domain) {
  throw new Error(
    "[lisible] FEATURES.webmentions is enabled but WEBMENTIONS.domain is empty. " +
      "Set the domain registered with webmention.io in shared/site.config.ts " +
      "(for example: domain: \"blog.example.com\") or disable the feature flag.",
  );
}
if (FEATURES.comments) {
  const g = COMMENTS.giscus;
  if (
    COMMENTS.provider === "giscus" &&
    !(g.repo && g.repoId && g.category && g.categoryId)
  ) {
    throw new Error(
      "[lisible] FEATURES.comments is enabled with the \"giscus\" provider, but " +
        "COMMENTS.giscus is incomplete (repo, repoId, category, categoryId). " +
        "Get these values from https://giscus.app and add them to shared/site.config.ts, " +
        "or disable the feature flag.",
    );
  }
  if (COMMENTS.provider === "bluesky" && !COMMENTS.bluesky.handle) {
    throw new Error(
      "[lisible] FEATURES.comments is enabled with the \"bluesky\" provider, but " +
        "INTEGRATIONS.comments.bluesky.postUri is empty in shared/site.config.ts. " +
        "Set the root post at:// URI or disable the feature flag.",
    );
  }
}

for (const locale of ["fr", "en"] as const) {
  pluginFramesTexts.overrideTexts(locale, {
    copyButtonTooltip: codeStrings[locale].copy,
    copyButtonCopied: codeStrings[locale].copied,
    terminalWindowFallbackTitle: codeStrings[locale].terminal,
  });
  pluginCollapsibleSectionsTexts.overrideTexts(locale, {
    collapsedLines: codeStrings[locale].collapsedLines,
  });
}

const copyIconSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' " +
  "stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>" +
  "<rect width='14' height='14' x='8' y='8' rx='2' ry='2'/>" +
  "<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>" +
  "</svg>";
const copyIcon = `url("data:image/svg+xml,${encodeURIComponent(copyIconSvg)}")`;

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
      themeCssSelector: (theme) =>
        theme.name === "github-dark" ? ".dark" : ":root:not(.dark)",
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
          "ansi,bash,bat,batch,cmd,console,diff,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,txt,zsh":
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
        scrollbarThumbColor: "color-mix(in oklab, var(--color-muted-foreground) 40%, transparent)",
        scrollbarThumbHoverColor: "color-mix(in oklab, var(--color-muted-foreground) 65%, transparent)",
        frames: {
          frameBoxShadowCssValue: "none",
          editorBackground: "var(--color-card)",
          editorTabBarBackground: "color-mix(in oklab, var(--color-muted) 40%, transparent)",
          editorTabBarBorderBottomColor: "var(--color-border)",
          editorActiveTabBackground: "var(--color-card)",
          editorActiveTabForeground: "var(--color-muted-foreground)",
          editorActiveTabBorderColor: "var(--color-border)",
          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBorderRadius: "0",
          terminalBackground: "var(--color-card)",
          terminalTitlebarBackground: "color-mix(in oklab, var(--color-muted) 40%, transparent)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarForeground: "var(--color-muted-foreground)",
          terminalTitlebarDotsForeground: "var(--color-muted-foreground)",
          inlineButtonBackground: "var(--color-secondary)",
          inlineButtonBackgroundIdleOpacity: "0",
          inlineButtonBackgroundHoverOrFocusOpacity: "1",
          inlineButtonBackgroundActiveOpacity: "1",
          inlineButtonForeground: "var(--color-muted-foreground)",
          inlineButtonBorder: "var(--color-border)",
          copyIcon,
          tooltipSuccessBackground: "var(--color-popover)",
          tooltipSuccessForeground: "var(--color-foreground)",
        },
        lineNumbers: {
          foreground: "var(--color-muted-foreground)",
        },
        collapsibleSections: {
          closedTextColor: "var(--color-muted-foreground)",
          closedBackgroundColor: "color-mix(in oklab, var(--color-muted) 50%, transparent)",
          closedBorderColor: "var(--color-border)",
          openBackgroundColor: "color-mix(in oklab, var(--color-muted) 20%, transparent)",
          openBorderColor: "var(--color-border)",
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
      __FEATURE_IMAGE_ZOOM__: JSON.stringify(FEATURES.imageZoom),
      __FEATURE_MERMAID__: JSON.stringify(FEATURES.mermaid),
      __FEATURE_DRAWIO__: JSON.stringify(FEATURES.drawio),
      __FEATURE_COMMAND_PALETTE__: JSON.stringify(FEATURES.commandPalette),
    },
    preview: {
      allowedHosts: ["blog.example.com"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins: [
        remarkDirective,
        ...(FEATURES.callouts ? [remarkCallouts] : []),
        ...(FEATURES.mermaid ? [remarkMermaid] : []),
        ...(FEATURES.drawio ? [remarkDrawio] : []),
        ...(FEATURES.math ? [remarkMath] : []),
        remarkGithubCard,
        remarkLinkCard,
      ],
      rehypePlugins: [
        rehypeTaskCheckboxes,
        ...(FEATURES.math ? [rehypeKatex] : []),
        ...(FEATURES.headingAnchors ? [rehypeHeadingIds, rehypeHeadingAnchors] : []),
      ],
    }),
  },
});
