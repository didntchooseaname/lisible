// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  buildKitGithubCard,
  createRemarkGithubCard,
} from "../../../../shared/markdown/remark-github-card";

export const remarkGithubCard = createRemarkGithubCard({
  directiveTypes: "all",
  isValidRepo: (repo, directiveType) =>
    directiveType === "leafDirective" && !!repo && /^[\w.-]+\/[\w.-]+$/.test(repo),
  wrapProperties: { class: "card-github-container" },
  invalidProperties: { hidden: true },
  card: (repo) =>
    buildKitGithubCard(repo, {
      statValueClass: "gc-num",
      srClass: "sr-only gc-stat-label",
      detailedLanguage: true,
    }),
});
