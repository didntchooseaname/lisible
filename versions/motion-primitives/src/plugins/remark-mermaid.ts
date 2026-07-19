import type { Root, Code } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { defaultLocale, ui, type Locale } from "#src/i18n/ui";

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

const svg = (inner: string, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  grid: '<path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h7v7h-7z"/>',
  zoomOut: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>',
  zoomIn: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};

let counter = 0;

function containerHtml(code: string, locale: Locale): string {
  const dict = ui[locale].mermaid;
  const id = `mermaid-${(counter += 1).toString(36)}`;
  const encoded = Buffer.from(code, "utf-8").toString("base64");
  const btn = (attr: string, label: string, icon: string) =>
    `<button type="button" ${attr} class="mermaid-btn" title="${label}" aria-label="${label}">${svg(icon)}</button>`;

  return `<div class="mermaid-embed not-prose" data-mermaid-container id="${id}">
  <div class="mermaid-toolbar">
    <span class="mermaid-label">${svg(ICONS.grid, 16)}<span>${dict.label}</span></span>
    <div class="mermaid-actions">
      ${btn("data-mermaid-zoom-out", dict.zoomOut, ICONS.zoomOut)}
      <span class="mermaid-level" data-mermaid-zoom-level>100%</span>
      ${btn("data-mermaid-zoom-in", dict.zoomIn, ICONS.zoomIn)}
      ${btn("data-mermaid-zoom-reset", dict.reset, ICONS.reset)}
      ${btn("data-mermaid-copy", dict.copy, ICONS.copy)}
    </div>
  </div>
  <div class="mermaid-viewport" data-mermaid-viewport>
    <div class="mermaid-pan" data-mermaid-pan>
      <div class="mermaid-render" data-mermaid-render></div>
    </div>
    <div class="mermaid-loading" data-mermaid-loading>${dict.loading}</div>
    <div class="mermaid-hint" data-mermaid-hint>${dict.hint}</div>
  </div>
  <pre class="mermaid-fallback" data-mermaid-fallback hidden>${escapeHtml(code)}</pre>
  <div data-mermaid-source="${encoded}" hidden></div>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const remarkMermaid: Plugin<[], Root> = () => {
  return (tree, file) => {
    const locale = localeFromPath(file?.path);
    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid") return;
      const html = containerHtml(node.value, locale);
      const target = node as unknown as { type: string; value: string; lang?: null; meta?: null };
      target.type = "html";
      target.value = html;
      target.lang = null;
      target.meta = null;
    });
  };
};

export default remarkMermaid;
