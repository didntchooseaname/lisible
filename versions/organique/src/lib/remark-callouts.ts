// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { h } from "hastscript";
import {
  CALLOUT_BUBBLE_PATH,
  CALLOUT_CHEVRON_PATH,
  CALLOUT_OCTAGON_PATH,
  CALLOUT_TIP_PATHS,
  CALLOUT_WARNING_PATHS,
  type CalloutVariant,
  createRemarkCallouts,
  STROKE_ICON_ATTRS,
} from "../../../../shared/markdown/remark-callouts";
import { cardLocaleFromPath, cardStrings } from "../i18n/cards";

const ICONS: Record<CalloutVariant, ElementContent[]> = {
  note: [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 16v-4" }),
    h("path", { d: "M12 8h.01" }),
  ],
  tip: CALLOUT_TIP_PATHS.map((d) => h("path", { d })),
  warning: CALLOUT_WARNING_PATHS.map((d) => h("path", { d })),
  caution: [
    h("path", { d: CALLOUT_OCTAGON_PATH }),
    h("path", { d: "M12 8v4" }),
    h("path", { d: "M12 16h.01" }),
  ],
  important: [
    h("path", { d: CALLOUT_BUBBLE_PATH }),
    h("path", { d: "M12 7v2" }),
    h("path", { d: "M12 13h.01" }),
  ],
};

const icon = (variant: CalloutVariant): ElementContent =>
  h(
    "svg",
    {
      class: "callout-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      ...STROKE_ICON_ATTRS,
    },
    ICONS[variant],
  );

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      class: "callout-chevron",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
    },
    [h("path", { d: CALLOUT_CHEVRON_PATH })],
  );

export default createRemarkCallouts({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  title: (locale, variant) => cardStrings[locale].callout[variant],
  labelMode: "deep-text",
  markup: {
    staticTag: "aside",
    collapsibleClass: true,
    headerClass: "callout-header",
    wrapBody: true,
    header: { kind: "hast", icon, titleClass: "callout-title", chevron },
  },
});
