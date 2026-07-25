import { setupHeadingAnchors, swapIconFeedback } from "../../../../shared/scripts/heading-anchors";

const FEEDBACK = {
  fr: "Lien copié",
  en: "Link copied",
} as const;

const CHECK_ICON =
  '<svg class="heading-anchor-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

setupHeadingAnchors({
  selector: "[data-heading-anchor]",
  bind: "both",
  urlStyle: "page-hash",
  copy: "await-ignore",
  feedback: swapIconFeedback({
    icon: CHECK_ICON,
    label: () => (document.documentElement.lang === "en" ? FEEDBACK.en : FEEDBACK.fr),
  }),
});
