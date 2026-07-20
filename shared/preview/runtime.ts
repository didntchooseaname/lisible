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

function accessibleAccent(hex: string, dark: boolean) {
  const value = Number.parseInt(hex.slice(1), 16);
  let rgb = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const luminance = (channels: number[]) => {
    const linear = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  };
  const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  for (let index = 0; index < 60; index += 1) {
    if (dark ? contrast(luminance(rgb), 0) >= 3 : contrast(luminance(rgb), 1) >= 4.5) break;
    rgb = rgb.map((channel) => dark
      ? Math.min(255, Math.round(channel + (255 - channel) * 0.06) + 1)
      : Math.max(0, Math.round(channel * 0.94) - 1));
  }
  const resolvedLuminance = luminance(rgb);
  return {
    accent: `rgb(${rgb.join(" ")})`,
    foreground: contrast(resolvedLuminance, 0) >= 4.5 ? "#000000" : "#ffffff",
  };
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
  return dark;
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

function applyCoverPosition(settings: PreviewSettingsV1) {
  for (const article of document.querySelectorAll<HTMLElement>("article[data-pagefind-body]")) {
    const marker = article.querySelector<HTMLElement>("[data-preview-cover]");
    const header = article.querySelector<HTMLElement>("header");
    if (!marker || !header) continue;

    const cover = marker.closest<HTMLElement>("[data-post-cover]") ?? marker;
    let headerBlock = header;
    while (headerBlock.parentElement && headerBlock.parentElement !== article) {
      headerBlock = headerBlock.parentElement;
    }
    if (headerBlock.parentElement !== article) continue;

    cover.classList.toggle("cover--down", settings.variant === "motion-primitives" && settings.coverPosition === "down");
    cover.classList.toggle("article-cover", settings.variant === "cult-ui" && settings.coverPosition === "up");
    cover.classList.toggle("article-cover-down", settings.variant === "cult-ui" && settings.coverPosition === "down");
    cover.classList.toggle("cover--head", settings.variant === "aceternity" && settings.coverPosition === "up");
    cover.classList.toggle("cover--body", settings.variant === "aceternity" && settings.coverPosition === "down");
    cover.classList.toggle("post-cover-down", settings.variant === "organique" && settings.coverPosition === "down");

    if (settings.coverPosition === "up") article.insertBefore(cover, headerBlock);
    else headerBlock.after(cover);
  }
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
  const dark = applyTheme(settings);
  const colors = accessibleAccent(settings.accent, dark);
  root.dataset.theme = settings.theme;
  root.dataset.resolvedTheme = dark ? "dark" : "light";
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.foreground);
  root.style.setProperty("--ring", colors.accent);
  try {
    localStorage.setItem("accent", settings.accent);
  } catch {}
  applyIdentity(settings);
  applyCoverPosition(settings);
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
  if (activeSettings?.theme === "system") applySettings(activeSettings);
});
document.addEventListener("astro:page-load", announceReady);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", announceReady, { once: true });
else announceReady();
