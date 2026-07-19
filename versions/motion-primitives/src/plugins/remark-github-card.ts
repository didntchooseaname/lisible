import { h, s } from "hastscript";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { defaultLocale, ui, type Locale } from "#src/i18n/ui";

type DirectiveNode = {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: unknown[];
  };
};

const GITHUB_LOGO_PATH =
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";

const svgIcon = (className: string, children: unknown[], viewBox = "0 0 24 24", filled = false) =>
  s(
    "svg",
    {
      class: className,
      viewBox,
      width: 16,
      height: 16,
      fill: filled ? "currentColor" : "none",
      stroke: filled ? "none" : "currentColor",
      "stroke-width": filled ? undefined : 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    children,
  );

const starIcon = () =>
  svgIcon("gh-icon", [
    s("path", {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
    }),
  ]);

const forkIcon = () =>
  svgIcon("gh-icon", [
    s("circle", { cx: 12, cy: 18, r: 3 }),
    s("circle", { cx: 6, cy: 6, r: 3 }),
    s("circle", { cx: 18, cy: 6, r: 3 }),
    s("path", { d: "M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" }),
    s("path", { d: "M12 12v3" }),
  ]);

const githubLogo = () =>
  svgIcon("gh-logo", [s("path", { d: GITHUB_LOGO_PATH })], "0 0 24 24", true);

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

const remarkGithubCard: Plugin<[], Root> = () => {
  return (tree, file) => {
    const dict = ui[localeFromPath(file?.path)].github;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (
        directive.type !== "containerDirective" &&
        directive.type !== "leafDirective" &&
        directive.type !== "textDirective"
      )
        return;
      if (directive.name !== "github") return;

      const data = directive.data ?? (directive.data = {});
      const repo = directive.attributes?.repo ?? "";

      if (!repo.includes("/")) {
        data.hName = "div";
        data.hProperties = { hidden: true };
        data.hChildren = [];
        return;
      }

      const [owner, name] = repo.split("/");

      data.hName = "div";
      data.hProperties = { class: "gh-card-wrap" };
      data.hChildren = [
        h(
          "a",
          {
            class: "gh-card",
            href: `https://github.com/${repo}`,
            target: "_blank",
            rel: "noopener noreferrer",
            "data-github-repo": repo,
            "aria-label": dict.repoCard(repo),
          },
          [
            h("span", { class: "gh-titlebar" }, [
              h("span", { class: "gh-avatar", "aria-hidden": "true" }),
              h("span", { class: "gh-owner" }, owner),
              h("span", { class: "gh-sep", "aria-hidden": "true" }, "/"),
              h("span", { class: "gh-name" }, name),
              githubLogo(),
            ]),
            h("span", { class: "gh-desc" }),
            h("span", { class: "gh-meta" }, [
              h("span", { class: "gh-stat gh-stars" }, [
                starIcon(),
                h("span", { class: "gh-count", "data-github-stars": "" }),
                h("span", { class: "gh-sr" }, ` ${dict.stars}`),
              ]),
              h("span", { class: "gh-stat gh-forks" }, [
                forkIcon(),
                h("span", { class: "gh-count", "data-github-forks": "" }),
                h("span", { class: "gh-sr" }, ` ${dict.forks}`),
              ]),
              h("span", { class: "gh-lang" }, [
                h("span", { class: "gh-sr" }, `${dict.language}: `),
                h("span", { class: "gh-lang-name", "data-github-language": "" }),
              ]),
            ]),
          ],
        ),
      ];
    });
  };
};

export default remarkGithubCard;
