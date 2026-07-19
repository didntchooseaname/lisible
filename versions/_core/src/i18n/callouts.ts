import { cardLocaleFromPath, type CardLocale } from "./cards";

export const calloutVariants = [
  "note",
  "tip",
  "warning",
  "caution",
  "important",
] as const;

export type CalloutVariant = (typeof calloutVariants)[number];

type CalloutTitles = Record<CalloutVariant, string>;

const fr: CalloutTitles = {
  note: "Note",
  tip: "Astuce",
  warning: "Avertissement",
  caution: "Attention",
  important: "Important",
};

const en: CalloutTitles = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  caution: "Caution",
  important: "Important",
};

export const calloutTitles: Record<CardLocale, CalloutTitles> = { fr, en };

export function isCalloutVariant(name: string): name is CalloutVariant {
  return (calloutVariants as readonly string[]).includes(name);
}

export { cardLocaleFromPath };
