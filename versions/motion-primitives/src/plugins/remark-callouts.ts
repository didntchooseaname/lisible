// Relative path: this module is imported by astro.config.ts, which loads before
// the @shared alias exists.
import {
  CALLOUT_TIP_PATHS,
  CALLOUT_WARNING_PATHS,
  type CalloutVariant,
  createRemarkCallouts,
} from "../../../../shared/markdown/remark-callouts";
import { defaultLocale, type Locale, ui } from "../i18n/ui";

const path = (d: string): string => `<path d="${d}"/>`;

const ICONS: Record<CalloutVariant, string> = {
  note: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  tip: CALLOUT_TIP_PATHS.map(path).join(""),
  warning: CALLOUT_WARNING_PATHS.map(path).join(""),
  caution:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  important:
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
};

function iconSvg(kind: CalloutVariant): string {
  return `<svg class="callout-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[kind]}</svg>`;
}

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

export default createRemarkCallouts({
  locale: (file) => localeFromPath(file?.path),
  title: (locale, variant) => ui[locale].callouts[variant],
  labelMode: "shallow-raw",
  markup: {
    staticTag: "aside",
    collapsibleClass: false,
    rootExtras: (variant, collapsible) =>
      collapsible ? { "data-callout": variant } : { role: "note", "data-callout": variant },
    headerClass: "callout-title",
    header: { kind: "raw", icon: iconSvg },
  },
});
