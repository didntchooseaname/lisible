import { navigate } from "astro:transitions/client";
import {
  PREVIEW_CHANNEL,
  PREVIEW_PROTOCOL_VERSION,
  isPreviewEnvelope,
  isPreviewSettings,
  type PreviewFrameMessage,
  type PreviewSettingsV1,
} from "./protocol";
import { withPreviewBase, withoutPreviewBase } from "./url";

let activeSettings: PreviewSettingsV1 | null = null;

function emit(message: PreviewFrameMessage) {
  if (window.parent === window) return;
  window.parent.postMessage(message, window.location.origin);
}

function envelope<T extends PreviewFrameMessage>(message: Omit<T, "channel" | "version">): T {
  return {
    channel: PREVIEW_CHANNEL,
    version: PREVIEW_PROTOCOL_VERSION,
    ...message,
  } as T;
}

function foreground(hex: string): string {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  return luminance > 0.42 ? "#07110a" : "#ffffff";
}

function applyTheme(settings: PreviewSettingsV1) {
  const dark = settings.theme === "dark"
    || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  try {
    if (settings.theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", settings.theme);
  } catch {}
}

function applyIdentity(settings: PreviewSettingsV1) {
  for (const element of document.querySelectorAll<HTMLElement>("[data-preview-site-title]")) {
    element.textContent = settings.title;
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-preview-author]")) {
    element.textContent = settings.author;
  }
  const previousTitle = document.documentElement.dataset.previewTitle || "Lisible";
  const escapedTitle = previousTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  document.title = document.title.replace(new RegExp(escapedTitle, "gi"), settings.title);
  document.documentElement.dataset.previewTitle = settings.title;
}

function applySettings(settings: PreviewSettingsV1) {
  activeSettings = settings;
  const root = document.documentElement;
  root.dataset.previewVariant = settings.variant;
  root.dataset.previewDensity = settings.density;
  root.dataset.previewCoverPosition = settings.coverPosition;
  root.dataset.previewCovers = String(settings.covers);
  root.dataset.previewFeatured = String(settings.featured);
  root.dataset.previewRelated = String(settings.relatedPosts);
  root.dataset.previewMotion = settings.motion;
  root.style.setProperty("--accent", settings.accent);
  root.style.setProperty("--accent-foreground", foreground(settings.accent));
  root.style.setProperty("--ring", settings.accent);
  try {
    localStorage.setItem("accent", settings.accent);
  } catch {}
  applyTheme(settings);
  applyIdentity(settings);
  window.dispatchEvent(new CustomEvent("lisible:preview-settings", { detail: settings }));
}

async function onMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.source !== window.parent || !isPreviewEnvelope(event.data)) return;
  if (event.data.type === "settings" && isPreviewSettings(event.data.settings)) {
    applySettings(event.data.settings);
    return;
  }
  if (event.data.type === "navigate" && typeof event.data.path === "string" && /^\/(?!\/)/.test(event.data.path) && !event.data.path.includes("..")) {
    try {
      await navigate(withPreviewBase(event.data.path));
    } catch (error) {
      emit(envelope({ type: "error", message: error instanceof Error ? error.message : "Navigation failed" }));
    }
  }
}

function announceReady() {
  if (activeSettings) applySettings(activeSettings);
  const path = withoutPreviewBase(window.location.pathname);
  emit(envelope({ type: "ready", path }));
  emit(envelope({ type: "route", path }));
}

window.addEventListener("message", onMessage);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (activeSettings?.theme === "system") applyTheme(activeSettings);
});
document.addEventListener("astro:page-load", announceReady);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", announceReady, { once: true });
else announceReady();
