// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  buildClassicGithubCard,
  createRemarkGithubCard,
} from "../../../../shared/markdown/remark-github-card";
import { type CardLocale, cardLocaleFromPath, cardStrings } from "../i18n/cards";

const remarkGithubCard = createRemarkGithubCard<CardLocale>({
  directiveTypes: "leaf",
  isValidRepo: (repo) => repo?.includes("/") === true,
  wrapProperties: { class: "github-card-wrap" },
  invalidProperties: { style: "display:none" },
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  card: (repo, locale) => buildClassicGithubCard(repo, cardStrings[locale].github),
});

export default remarkGithubCard;
