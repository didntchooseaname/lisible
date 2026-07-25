// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  buildKitGithubCard,
  createRemarkGithubCard,
} from "../../../../shared/markdown/remark-github-card";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const remarkGithubCard = createRemarkGithubCard<Locale>({
  directiveTypes: "all",
  isValidRepo: (repo) => repo?.includes("/") === true,
  wrapProperties: { class: "card-github__container" },
  invalidProperties: { style: "display:none" },
  locale: (file) => (/[\\/]en[\\/]/.test(file?.path ?? "") ? "en" : defaultLocale),
  card: (repo, locale) => {
    const dict = ui[locale].githubCard;
    return buildKitGithubCard(repo, {
      ariaLabel: dict.viewOnGithub(repo),
      loadingText: dict.loading,
      statValueClass: "gc-stat-value",
      srClass: "sr-only",
      srStars: ` ${dict.stars}`,
      srForks: ` ${dict.forks}`,
      detailedLanguage: false,
    });
  },
});

export default remarkGithubCard;
