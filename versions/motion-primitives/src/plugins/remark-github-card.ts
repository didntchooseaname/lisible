// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  buildMonoGithubCard,
  createRemarkGithubCard,
} from "../../../../shared/markdown/remark-github-card";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const remarkGithubCard = createRemarkGithubCard<Locale>({
  directiveTypes: "all",
  isValidRepo: (repo) => (repo ?? "").includes("/"),
  wrapProperties: { class: "gh-card-wrap" },
  invalidProperties: { hidden: true },
  locale: (file) => (file?.path && /[\\/]en[\\/]/.test(file.path) ? "en" : defaultLocale),
  card: (repo, locale) => buildMonoGithubCard(repo, ui[locale].github),
});

export default remarkGithubCard;
