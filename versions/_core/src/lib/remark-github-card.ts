import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { cardLocaleFromPath, cardStrings } from "#src/i18n/cards";

const GITHUB_LOGO_PATH =
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";

const svgIcon = (children: ElementContent[], filled = false): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      fill: filled ? "currentColor" : "none",
      stroke: filled ? "none" : "currentColor",
      "stroke-width": filled ? undefined : "2",
      "stroke-linecap": filled ? undefined : "round",
      "stroke-linejoin": filled ? undefined : "round",
      "aria-hidden": "true",
    },
    children,
  );

const starIcon = (): ElementContent =>
  svgIcon([
    h("path", {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
    }),
  ]);

const forkIcon = (): ElementContent =>
  svgIcon([
    h("circle", { cx: "12", cy: "18", r: "3" }),
    h("circle", { cx: "6", cy: "6", r: "3" }),
    h("circle", { cx: "18", cy: "6", r: "3" }),
    h("path", { d: "M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" }),
    h("path", { d: "M12 12v3" }),
  ]);

const codeIcon = (): ElementContent =>
  svgIcon([h("path", { d: "m16 18 6-6-6-6" }), h("path", { d: "m8 6-6 6 6 6" })]);

const githubLogo = (): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: "currentColor",
      "aria-hidden": "true",
      class: "gc-logo",
    },
    [h("path", { d: GITHUB_LOGO_PATH })],
  );

const stat = (
  className: string,
  dataAttr: string,
  icon: ElementContent,
  label: string,
): ElementContent =>
  h("span", { class: `gc-stat ${className}` }, [
    icon,
    h("span", { class: "gc-sr" }, `${label}: `),
    h("span", { [dataAttr]: "" }, ""),
  ]);

const buildCard = (repo: string, locale: ReturnType<typeof cardLocaleFromPath>): ElementContent => {
  const labels = cardStrings[locale].github;
  const [owner, name] = repo.split("/");

  return h(
    "a",
    {
      class: "github-card is-loading",
      href: `https://github.com/${repo}`,
      target: "_blank",
      rel: "noopener noreferrer",
      "data-github-repo": repo,
      title: labels.viewOnGithub,
    },
    [
      h("span", { class: "gc-titlebar" }, [
        h("span", { class: "gc-titlebar-left" }, [
          h("span", { class: "gc-avatar", "aria-hidden": "true" }),
          h("span", { class: "gc-owner" }, owner),
          h("span", { class: "gc-divider", "aria-hidden": "true" }, "/"),
          h("span", { class: "gc-repo" }, name),
        ]),
        githubLogo(),
      ]),
      h("span", { class: "gc-description", "data-gc-description": "" }, labels.loading),
      h("span", { class: "gc-infobar" }, [
        stat("gc-stars", "data-gc-stars", starIcon(), labels.stars),
        stat("gc-forks", "data-gc-forks", forkIcon(), labels.forks),
        stat("gc-language", "data-gc-language", codeIcon(), labels.language),
      ]),
    ],
  );
};

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
  };
}

const remarkGithubCard: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree, file) => {
    const locale = cardLocaleFromPath(file?.path ?? file?.history?.[0]);

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "leafDirective" || directive.name !== "github") return;

      const repo = directive.attributes?.repo;
      const data = directive.data ?? (directive.data = {});

      if (!repo || !repo.includes("/")) {
        data.hName = "div";
        data.hProperties = { style: "display:none" };
        data.hChildren = [];
        return;
      }

      data.hName = "div";
      data.hProperties = { class: "github-card-wrap" };
      data.hChildren = [buildCard(repo, locale)];
    });
  };

  return transformer;
};

export default remarkGithubCard;
