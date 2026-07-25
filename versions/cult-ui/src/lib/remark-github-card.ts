// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  buildCultGithubCard,
  createRemarkGithubCard,
} from "../../../../shared/markdown/remark-github-card";

const remarkGithubCard = createRemarkGithubCard({
  directiveTypes: "all",
  isValidRepo: (repo) => repo?.includes("/") === true,
  wrapProperties: { class: "gh-card-wrap" },
  invalidProperties: { class: "gh-card-wrap", hidden: true },
  card: (repo) => buildCultGithubCard(repo),
});

export default remarkGithubCard;
