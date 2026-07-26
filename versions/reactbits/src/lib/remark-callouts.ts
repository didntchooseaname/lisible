// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { s } from "hastscript";
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
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  ...STROKE_ICON_ATTRS,
  class: "callout__icon",
} as const;

const ICON_PATHS: Record<CalloutVariant, readonly string[]> = {
  note: ["M12 16v-4", "M12 8h.01"],
  tip: CALLOUT_TIP_PATHS,
  warning: CALLOUT_WARNING_PATHS,
  caution: ["M12 16h.01", "M12 8v4", CALLOUT_OCTAGON_PATH],
  important: ["M12 7v2", "M12 13h.01", CALLOUT_BUBBLE_PATH],
};

const icon = (variant: CalloutVariant): ElementContent => {
  const children =
    variant === "note"
      ? [
          s("circle", { cx: "12", cy: "12", r: "10" }),
          ...ICON_PATHS.note.map((d) => s("path", { d })),
        ]
      : ICON_PATHS[variant].map((d) => s("path", { d }));
  return s("svg", { ...ICON_ATTRS }, children);
};

const chevron = (): ElementContent =>
  s(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      ...STROKE_ICON_ATTRS,
      class: "callout__chevron",
    },
    [s("path", { d: CALLOUT_CHEVRON_PATH })],
  );

export default createRemarkCallouts({
  locale: (file): Locale => (/[\\/]en[\\/]/.test(file?.path ?? "") ? "en" : defaultLocale),
  title: (locale, variant) => ui[locale].callouts[variant],
  labelMode: "shallow-text",
  markup: {
    staticTag: "aside",
    classSeparator: "--",
    collapsibleClass: false,
    rootExtras: (variant, collapsible) => ({
      "data-callout": variant,
      ...(collapsible ? {} : { role: "note" }),
    }),
    headerClass: "callout__header",
    header: { kind: "hast", icon, titleClass: "callout__title", chevron },
  },
});
