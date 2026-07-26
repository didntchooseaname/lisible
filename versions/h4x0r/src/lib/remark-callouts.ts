// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { h } from "hastscript";
import {
  CALLOUT_CHEVRON_PATH,
  CALLOUT_OCTAGON_PATH,
  CALLOUT_TIP_PATHS,
  type CalloutVariant,
  createRemarkCallouts,
  STROKE_ICON_ATTRS,
} from "../../../../shared/markdown/remark-callouts";
import { cardLocaleFromPath } from "../i18n/cards";
import { contentStrings } from "../i18n/content";

const ICON_PATHS: Record<CalloutVariant, readonly string[]> = {
  note: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01",
  ],
  tip: CALLOUT_TIP_PATHS,
  warning: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  caution: ["M12 16h.01", "M12 8v4", CALLOUT_OCTAGON_PATH],
  important: [
    "M22 17a2 2 0 0 1-2 2H6.5a1 1 0 0 0-.8.4l-1.9 2.533A1 1 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
    "M12 15h.01",
    "M12 7v4",
  ],
};

const icon = (variant: CalloutVariant): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
      class: "callout-icon",
    },
    ICON_PATHS[variant].map((d) => h("path", { d })),
  );

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "14",
      height: "14",
      ...STROKE_ICON_ATTRS,
      class: "callout-chevron",
    },
    [h("path", { d: CALLOUT_CHEVRON_PATH })],
  );

export default createRemarkCallouts({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  title: (locale, variant) => contentStrings[locale].callouts[variant],
  labelMode: "deep-text",
  markup: {
    staticTag: "div",
    collapsibleClass: true,
    headerStaticTag: "p",
    headerClass: "callout-title",
    header: { kind: "hast", icon, titleClass: "callout-title-text", chevron },
  },
});
