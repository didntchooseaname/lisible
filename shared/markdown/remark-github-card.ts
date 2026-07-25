import type { ElementContent } from "hast";
import { h, s } from "hastscript";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";

/**
 * Shared core of the remark github card plugin. The directive walking, the
 * icon geometry and the card markup families live here; every variant keeps
 * its exact class naming contract, attribute order and accessibility choices
 * through options. Labels are injected by the adapters because each variant
 * has its own i18n source. The rendered HTML must stay byte for byte
 * identical to the historical forks.
 */

const GITHUB_LOGO_PATH =
  "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";

const STAR_PATH =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

const FORK_CIRCLES = [
  { cx: "12", cy: "18", r: "3" },
  { cx: "6", cy: "6", r: "3" },
  { cx: "18", cy: "6", r: "3" },
] as const;
const FORK_PATHS = ["M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9", "M12 12v3"] as const;
const CODE_PATHS = ["m16 18 6-6-6-6", "m8 6-6 6 6 6"] as const;

const forkChildren = (builder: typeof h): ElementContent[] => [
  ...FORK_CIRCLES.map((circle) => builder("circle", { ...circle })),
  ...FORK_PATHS.map((d) => builder("path", { d })),
];

/* The classic family: github-card / gc-* classes, h() icons carrying xmlns
 * then viewBox then size, used by _core, h4x0r and organique. */

const classicIcon = (children: ElementContent[]): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    children,
  );

const classicLogo = (): ElementContent =>
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

export interface ClassicGithubCardLabels {
  stars: string;
  forks: string;
  language: string;
  loading: string;
  viewOnGithub: string;
}

export const buildClassicGithubCard = (
  repo: string,
  labels: ClassicGithubCardLabels,
): ElementContent => {
  const [owner, name] = repo.split("/");

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
        classicLogo(),
      ]),
      h("span", { class: "gc-description", "data-gc-description": "" }, labels.loading),
      h("span", { class: "gc-infobar" }, [
        stat("gc-stars", "data-gc-stars", classicIcon([h("path", { d: STAR_PATH })]), labels.stars),
        stat("gc-forks", "data-gc-forks", classicIcon(forkChildren(h)), labels.forks),
        stat(
          "gc-language",
          "data-gc-language",
          classicIcon(CODE_PATHS.map((d) => h("path", { d }))),
          labels.language,
        ),
      ]),
    ],
  );
};

/* The kit family: card-github / gc-* classes, s() icons carrying xmlns then
 * size then viewBox, used by aceternity and reactbits. */

const KIT_ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

const kitLogo = (): ElementContent =>
  s(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      "aria-hidden": "true",
    },
    [s("path", { d: GITHUB_LOGO_PATH })],
  );

export interface KitGithubCardOptions {
  /** Accessible label on the link; omitted entirely when undefined. */
  ariaLabel?: string;
  /** Placeholder text inside the description; empty span when undefined. */
  loadingText?: string;
  /** Class of the empty span the client script fills with the stat value. */
  statValueClass: string;
  /** Class of the screen reader span appended to each stat. */
  srClass: string;
  /** Screen reader text for the stats; empty spans when undefined. */
  srStars?: string;
  srForks?: string;
  /** true renders the dot plus name language block, false an empty span. */
  detailedLanguage: boolean;
}

export const buildKitGithubCard = (repo: string, options: KitGithubCardOptions): ElementContent => {
  const [owner, name] = repo.split("/");

  const sr = (text: string | undefined): ElementContent =>
    text === undefined
      ? h("span", { class: options.srClass })
      : h("span", { class: options.srClass }, [text]);

  const stat = (
    className: string,
    icon: ElementContent,
    srText: string | undefined,
  ): ElementContent =>
    h("span", { class: `gc-stat ${className}` }, [
      icon,
      h("span", { class: options.statValueClass }),
      sr(srText),
    ]);

  return h(
    "a",
    {
      class: "card-github fetch-waiting",
      href: `https://github.com/${repo}`,
      target: "_blank",
      rel: "noopener noreferrer",
      "data-github-repo": repo,
      ...(options.ariaLabel === undefined ? {} : { "aria-label": options.ariaLabel }),
    },
    [
      h("span", { class: "gc-titlebar" }, [
        h("span", { class: "gc-titlebar-left" }, [
          h("span", { class: "gc-avatar", "aria-hidden": "true" }),
          h("span", { class: "gc-user" }, owner),
          h("span", { class: "gc-divider", "aria-hidden": "true" }, "/"),
          h("span", { class: "gc-repo" }, name),
        ]),
        kitLogo(),
      ]),
      options.loadingText === undefined
        ? h("span", { class: "gc-description" })
        : h("span", { class: "gc-description" }, [options.loadingText]),
      h("span", { class: "gc-infobar" }, [
        stat(
          "gc-stars",
          s("svg", { ...KIT_ICON_ATTRS }, [s("path", { d: STAR_PATH })]),
          options.srStars,
        ),
        stat("gc-forks", s("svg", { ...KIT_ICON_ATTRS }, forkChildren(s)), options.srForks),
        options.detailedLanguage
          ? h("span", { class: "gc-language" }, [
              h("span", { class: "gc-language-dot", "aria-hidden": "true" }),
              h("span", { class: "gc-language-name" }),
              sr(undefined),
            ])
          : h("span", { class: "gc-language" }),
      ]),
    ],
  );
};

/* The cult family: gh-card-* classes, flat header, no labels, h() icons
 * without width or height, used by cult-ui. */

const CULT_ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

export const buildCultGithubCard = (repo: string): ElementContent => {
  const [owner, name] = repo.split("/");

  return h(
    "a",
    {
      class: "gh-card",
      href: `https://github.com/${repo}`,
      target: "_blank",
      rel: "noopener noreferrer",
      "data-gh-repo": repo,
    },
    [
      h("span", { class: "gh-card-header" }, [
        h("span", { class: "gh-card-avatar", "aria-hidden": "true" }),
        h("span", { class: "gh-card-owner" }, owner),
        h("span", { class: "gh-card-sep", "aria-hidden": "true" }, "/"),
        h("span", { class: "gh-card-name" }, name),
        h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            "aria-hidden": "true",
            class: "gh-card-logo",
          },
          [h("path", { d: GITHUB_LOGO_PATH })],
        ),
      ]),
      h("span", { class: "gh-card-desc" }),
      h("span", { class: "gh-card-meta" }, [
        h("span", { class: "gh-card-stat", "data-gh-stat": "stars" }, [
          h("svg", { ...CULT_ICON_ATTRS, class: "gh-card-icon" }, [h("path", { d: STAR_PATH })]),
          h("span", { class: "gh-card-count" }),
        ]),
        h("span", { class: "gh-card-stat", "data-gh-stat": "forks" }, [
          h("svg", { ...CULT_ICON_ATTRS, class: "gh-card-icon" }, forkChildren(h)),
          h("span", { class: "gh-card-count" }),
        ]),
        h("span", { class: "gh-card-lang", "data-gh-stat": "language" }, [
          h("span", { class: "gh-card-dot", "aria-hidden": "true" }),
          h("span", { class: "gh-card-count" }),
        ]),
      ]),
    ],
  );
};

/* The mono family: gh-* classes, flat titlebar, s() icons carrying class
 * first and no xmlns, used by motion-primitives. */

const monoIcon = (className: string, children: ElementContent[], filled = false): ElementContent =>
  s(
    "svg",
    {
      class: className,
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      fill: filled ? "currentColor" : "none",
      stroke: filled ? "none" : "currentColor",
      "stroke-width": filled ? undefined : "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    children,
  );

export interface MonoGithubCardLabels {
  stars: string;
  forks: string;
  language: string;
  repoCard: (repo: string) => string;
}

export const buildMonoGithubCard = (repo: string, labels: MonoGithubCardLabels): ElementContent => {
  const [owner, name] = repo.split("/");

  return h(
    "a",
    {
      class: "gh-card",
      href: `https://github.com/${repo}`,
      target: "_blank",
      rel: "noopener noreferrer",
      "data-github-repo": repo,
      "aria-label": labels.repoCard(repo),
    },
    [
      h("span", { class: "gh-titlebar" }, [
        h("span", { class: "gh-avatar", "aria-hidden": "true" }),
        h("span", { class: "gh-owner" }, owner),
        h("span", { class: "gh-sep", "aria-hidden": "true" }, "/"),
        h("span", { class: "gh-name" }, name),
        monoIcon("gh-logo", [s("path", { d: GITHUB_LOGO_PATH })], true),
      ]),
      h("span", { class: "gh-desc" }),
      h("span", { class: "gh-meta" }, [
        h("span", { class: "gh-stat gh-stars" }, [
          monoIcon("gh-icon", [s("path", { d: STAR_PATH })]),
          h("span", { class: "gh-count", "data-github-stars": "" }),
          h("span", { class: "gh-sr" }, ` ${labels.stars}`),
        ]),
        h("span", { class: "gh-stat gh-forks" }, [
          monoIcon("gh-icon", forkChildren(s)),
          h("span", { class: "gh-count", "data-github-forks": "" }),
          h("span", { class: "gh-sr" }, ` ${labels.forks}`),
        ]),
        h("span", { class: "gh-lang" }, [
          h("span", { class: "gh-sr" }, `${labels.language}: `),
          h("span", { class: "gh-lang-name", "data-github-language": "" }),
        ]),
      ]),
    ],
  );
};

/* The directive walking machinery. */

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

interface FileLike {
  path?: string;
  history?: string[];
}

export interface RemarkGithubCardOptions<L = undefined> {
  /** "leaf" only matches leaf directives, "all" matches the three kinds. */
  directiveTypes: "leaf" | "all";
  /** Exact validity predicate of the variant, given the raw repo attribute. */
  isValidRepo: (repo: string | undefined, directiveType: string) => boolean;
  /** hProperties of the wrapping div around a valid card. */
  wrapProperties: Record<string, unknown>;
  /** hProperties of the placeholder div replacing an invalid directive. */
  invalidProperties: Record<string, unknown>;
  /** Locale resolution from the processed file; labels stay in the adapter. */
  locale?: (file: FileLike | undefined) => L;
  /** Card markup builder, one of the exported families or a custom one. */
  card: (repo: string, locale: L) => ElementContent;
}

export const createRemarkGithubCard = <L = undefined>(
  options: RemarkGithubCardOptions<L>,
): Plugin<[], Root> => {
  return () => {
    const transformer: Transformer<Root> = (tree, file) => {
      const locale = options.locale?.(file as FileLike | undefined) as L;

      visit(tree, (node) => {
        const directive = node as unknown as DirectiveNode;
        if (options.directiveTypes === "leaf") {
          if (directive.type !== "leafDirective") return;
        } else if (
          directive.type !== "containerDirective" &&
          directive.type !== "leafDirective" &&
          directive.type !== "textDirective"
        ) {
          return;
        }
        if (directive.name !== "github") return;

        const repo = directive.attributes?.repo;
        const data = directive.data ?? (directive.data = {});

        if (!options.isValidRepo(repo, directive.type)) {
          data.hName = "div";
          data.hProperties = { ...options.invalidProperties };
          data.hChildren = [];
          return;
        }

        data.hName = "div";
        data.hProperties = { ...options.wrapProperties };
        data.hChildren = [options.card(repo as string, locale)];
      });
    };

    return transformer;
  };
};
