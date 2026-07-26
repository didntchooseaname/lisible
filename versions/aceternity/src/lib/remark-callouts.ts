// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import type { ElementContent } from "hast";
import { s } from "hastscript";
import {
  CALLOUT_BUBBLE_PATH,
  CALLOUT_OCTAGON_PATH,
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

const ICON_ATTRS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  ...STROKE_ICON_ATTRS,
} as const;

const ICON_PATHS: Record<CalloutVariant, readonly string[]> = {
  note: ["M12 16v-4", "M12 8h.01"],
  tip: CALLOUT_TIP_PATHS,
  warning: CALLOUT_WARNING_PATHS,
  caution: ["M12 16h.01", "M12 8v4", CALLOUT_OCTAGON_PATH],
  important: [CALLOUT_BUBBLE_PATH, "M12 7v2", "M12 13h.01"],
};

function icon(variant: CalloutVariant): ElementContent {
  const children =
    variant === "note"
      ? [
          s("circle", { cx: "12", cy: "12", r: "10" }),
          ...ICON_PATHS.note.map((d) => s("path", { d })),
        ]
      : ICON_PATHS[variant].map((d) => s("path", { d }));
  return s("svg", { ...ICON_ATTRS, class: "callout__icon" }, children);
}

export const remarkCallouts = createRemarkCallouts({
  locale: (file) => {
    const path = (file?.path || file?.history?.[0] || "").replace(/\\/g, "/");
    return path.includes("/blog/en/") ? "en" : "fr";
  },
  title: (locale, variant) => TITLES[locale][variant],
  labelMode: "deep-text",
  markup: {
    staticTag: "aside",
    collapsibleClass: true,
    headerClass: "callout__title",
    header: { kind: "hast", icon, titleClass: "callout__title-text" },
  },
});
