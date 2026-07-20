import type { PublicVariant } from "../variants";

export const PREVIEW_CHANNEL = "lisible-preview";
export const PREVIEW_PROTOCOL_VERSION = 1;

export type PreviewLocale = "fr" | "en";
export type PreviewTheme = "system" | "light" | "dark";
export type PreviewDensity = "comfortable" | "compact";
export type PreviewViewport = "responsive" | "desktop" | "tablet" | "mobile";

export interface PreviewSettingsV1 {
  version: 1;
  variant: PublicVariant;
  path: string;
  locale: PreviewLocale;
  theme: PreviewTheme;
  accent: string;
  title: string;
  author: string;
  density: PreviewDensity;
  coverPosition: "up" | "down";
  covers: boolean;
  featured: boolean;
  relatedPosts: boolean;
  motion: "full" | "reduced";
  viewport: PreviewViewport;
}

export interface PreviewVariantManifest {
  id: PublicVariant;
  label: string;
  description: string;
  basePath: string;
  buildHash: string;
  routes: Record<PreviewLocale, Record<"home" | "blog" | "post" | "tags" | "archives" | "about", string>>;
  capabilities: Array<keyof PreviewSettingsV1>;
}

export interface PreviewManifestV1 {
  version: 1;
  source: {
    repository: string;
    ref: "main";
    sha: string;
    syncedAt: string;
  };
  generatedAt: string;
  variants: PreviewVariantManifest[];
}

type PreviewEnvelope<TType extends string, TPayload extends object = Record<string, never>> = {
  channel: typeof PREVIEW_CHANNEL;
  version: typeof PREVIEW_PROTOCOL_VERSION;
  type: TType;
} & TPayload;

export type PreviewParentMessage =
  | PreviewEnvelope<"settings", { settings: PreviewSettingsV1 }>
  | PreviewEnvelope<"navigate", { path: string }>;

export type PreviewFrameMessage =
  | PreviewEnvelope<"ready", { path: string }>
  | PreviewEnvelope<"route", { path: string }>
  | PreviewEnvelope<"error", { message: string }>;

const variants = new Set<PublicVariant>([
  "motion-primitives",
  "cult-ui",
  "aceternity",
  "reactbits",
  "organique",
  "h4x0r",
]);

export function isPreviewSettings(value: unknown): value is PreviewSettingsV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PreviewSettingsV1>;
  return candidate.version === 1
    && variants.has(candidate.variant as PublicVariant)
    && typeof candidate.path === "string"
    && /^\/(?!\/)/.test(candidate.path)
    && (candidate.locale === "fr" || candidate.locale === "en")
    && (candidate.theme === "system" || candidate.theme === "light" || candidate.theme === "dark")
    && typeof candidate.accent === "string"
    && /^#[\da-f]{6}$/i.test(candidate.accent)
    && typeof candidate.title === "string"
    && candidate.title.length > 0
    && candidate.title.length <= 80
    && typeof candidate.author === "string"
    && candidate.author.length > 0
    && candidate.author.length <= 80
    && (candidate.density === "comfortable" || candidate.density === "compact")
    && (candidate.coverPosition === "up" || candidate.coverPosition === "down")
    && typeof candidate.covers === "boolean"
    && typeof candidate.featured === "boolean"
    && typeof candidate.relatedPosts === "boolean"
    && (candidate.motion === "full" || candidate.motion === "reduced")
    && ["responsive", "desktop", "tablet", "mobile"].includes(candidate.viewport ?? "");
}

export function isPreviewEnvelope(value: unknown): value is PreviewParentMessage | PreviewFrameMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { channel?: unknown; version?: unknown; type?: unknown };
  return candidate.channel === PREVIEW_CHANNEL
    && candidate.version === PREVIEW_PROTOCOL_VERSION
    && typeof candidate.type === "string";
}
