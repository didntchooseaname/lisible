import type { Root } from "mdast";
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
};

let counter = 0;

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children: Array<Record<string, unknown>>;
  data?: Record<string, unknown>;
}

const remarkDrawio: Plugin<[], Root> = () => {
  return (tree, file) => {
    const dict = ui[localeFromPath(file?.path)].drawio;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      if (directive.name !== "drawio") return;

      const id = `drawio-${(counter += 1).toString(36)}`;
      const src = directive.attributes?.src ?? "";
      const label = directive.attributes?.title || dict.label;

      const btn = (attr: string, l: string, icon: string) =>
        `<button type="button" ${attr} class="drawio-btn" title="${l}" aria-label="${l}">${svg(icon)}</button>`;

      const toolbar = `<div class="drawio-toolbar">
    <span class="drawio-label">${svg(ICONS.grid, 16)}<span>${label}</span></span>
    <div class="drawio-actions">
      ${btn("data-drawio-zoom-out", dict.zoomOut, ICONS.zoomOut)}
      <span class="drawio-level" data-drawio-zoom-level>100%</span>
      ${btn("data-drawio-zoom-in", dict.zoomIn, ICONS.zoomIn)}
      ${btn("data-drawio-zoom-reset", dict.reset, ICONS.reset)}
    </div>
  </div>`;

      const hint = `<div class="drawio-hint" data-drawio-hint>${dict.hint}</div>`;

      const body = directive.children.slice();

      const data = directive.data ?? (directive.data = {});
      data.hName = "div";
      data.hProperties = {
        class: "drawio-embed",
        id,
        "data-drawio-container": "",
        "data-drawio-src": src,
      };

      directive.children = [
        { type: "html", value: toolbar },
        {
          type: "paragraph",
          data: {
            hName: "div",
            hProperties: { class: "drawio-viewport", "data-drawio-viewport": "" },
          },
          children: [
            {
              type: "paragraph",
              data: {
                hName: "div",
                hProperties: { class: "drawio-pan", "data-drawio-pan": "" },
              },
              children: body,
            },
            { type: "html", value: hint },
          ],
        },
      ];
    });
  };
};

export default remarkDrawio;
