// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { h } from "hastscript";
import {
  CALLOUT_BUBBLE_PATH,
  CALLOUT_CHEVRON_PATH,
  CALLOUT_TIP_PATHS,
  CALLOUT_WARNING_PATHS,
  type CalloutVariant,
  createRemarkCallouts,
  STROKE_ICON_ATTRS,
} from "../../../../shared/markdown/remark-callouts";

const TITLES: Record<"fr" | "en", Record<CalloutVariant, string>> = {
  fr: {
    note: "Note",
    tip: "Astuce",
    warning: "Avertissement",
    caution: "Attention",
    important: "Important",
  },
  en: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
};

const ICON_PATHS: Record<CalloutVariant, readonly string[]> = {
  note: ["M12 16v-4", "M12 8h.01", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0"],
  tip: CALLOUT_TIP_PATHS,
  warning: CALLOUT_WARNING_PATHS,
  caution: [
    "M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z",
    "M12 8v4",
    "M12 16h.01",
  ],
  important: [CALLOUT_BUBBLE_PATH, "M12 7v2", "M12 13h.01"],
};

const icon = (variant: CalloutVariant): ElementContent =>
  h(
    "svg",
    {
      class: "callout-icon",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      ...STROKE_ICON_ATTRS,
    },
    ICON_PATHS[variant].map((d) => h("path", { d })),
  );

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      class: "callout-chevron",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      ...STROKE_ICON_ATTRS,
    },
    [h("path", { d: CALLOUT_CHEVRON_PATH })],
  );

export default createRemarkCallouts({
  locale: (file) => (file?.path?.includes("/blog/en/") ? "en" : "fr"),
  title: (locale, variant) => TITLES[locale][variant],
  labelMode: "text-nodes",
  markup: {
    staticTag: "aside",
    collapsibleClass: false,
    rootExtras: (_variant, collapsible) => (collapsible ? {} : { role: "note" }),
    headerClass: "callout-header",
    wrapBody: true,
    header: { kind: "hast", icon, titleClass: "callout-title", chevron },
  },
});
