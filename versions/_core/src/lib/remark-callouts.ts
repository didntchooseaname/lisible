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
import { calloutTitles, cardLocaleFromPath } from "../i18n/callouts";

const icon = (children: ElementContent[]): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      ...STROKE_ICON_ATTRS,
    },
    children,
  );

const icons: Record<CalloutVariant, ElementContent> = {
  note: icon([
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 16v-4" }),
    h("path", { d: "M12 8h.01" }),
  ]),
  tip: icon(CALLOUT_TIP_PATHS.map((d) => h("path", { d }))),
  warning: icon(CALLOUT_WARNING_PATHS.map((d) => h("path", { d }))),
  caution: icon([
    h("path", { d: CALLOUT_OCTAGON_PATH }),
    h("path", { d: "M12 8v4" }),
    h("path", { d: "M12 16h.01" }),
  ]),
  important: icon([
    h("path", { d: CALLOUT_BUBBLE_PATH }),
    h("path", { d: "M12 7v4" }),
    h("path", { d: "M12 15h.01" }),
  ]),
};

const chevron = (): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
      class: "callout-chevron",
    },
    [h("path", { d: CALLOUT_CHEVRON_PATH })],
  );

export default createRemarkCallouts({
  locale: (file) => cardLocaleFromPath(file?.path ?? file?.history?.[0]),
  title: (locale, variant) => calloutTitles[locale][variant],
  labelMode: "inline",
  markup: {
    staticTag: "div",
    collapsibleClass: true,
    rootExtras: (variant) => ({ "data-callout": variant }),
    headerClass: "callout-header",
    wrapBody: true,
    header: {
      kind: "wrapped",
      icon: (variant) => icons[variant],
      iconWrapClass: "callout-icon",
      titleClass: "callout-title",
      chevron,
      chevronWrapClass: "callout-chevron-wrap",
    },
  },
});
