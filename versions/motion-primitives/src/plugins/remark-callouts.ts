import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { defaultLocale, ui, type Locale } from "#src/i18n/ui";

type CalloutKind = "note" | "tip" | "warning" | "caution" | "important";

const KINDS: CalloutKind[] = ["note", "tip", "warning", "caution", "important"];

const ICONS: Record<CalloutKind, string> = {
  note: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  tip: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  warning:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  caution:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  important:
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
};

function iconSvg(kind: CalloutKind): string {
  return `<svg class="callout-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[kind]}</svg>`;
}

function localeFromPath(filePath: string | undefined): Locale {
  if (filePath && /[\\/]en[\\/]/.test(filePath)) return "en";
  return defaultLocale;
}

interface DirectiveNode {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined>;
  children: Array<Record<string, unknown> & { data?: Record<string, unknown> }>;
  data?: Record<string, unknown>;
}

function extractLabel(node: DirectiveNode): string | null {
  const first = node.children[0] as
    | { type: string; data?: { directiveLabel?: boolean }; children?: Array<{ value?: string }> }
    | undefined;
  if (first?.data?.directiveLabel) {
    node.children.shift();
    return (first.children ?? []).map((c) => c.value ?? "").join("");
  }
  return null;
}

const remarkCallouts: Plugin<[], Root> = () => {
  return (tree, file) => {
    const dict = ui[localeFromPath(file?.path)].callouts;

    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;
      if (directive.type !== "containerDirective") return;
      const kind = directive.name as CalloutKind;
      if (!KINDS.includes(kind)) return;

      const label = extractLabel(directive);
      const title = label ?? dict[kind];
      const collapse =
        directive.attributes && "collapse" in directive.attributes;

      const titleChildren = [
        { type: "html", value: iconSvg(kind) },
        { type: "text", value: title },
      ];

      const data = directive.data ?? (directive.data = {});

      if (collapse) {
        data.hName = "details";
        data.hProperties = { class: `callout callout-${kind}`, "data-callout": kind };
        directive.children.unshift({
          type: "paragraph",
          data: { hName: "summary", hProperties: { class: "callout-title" } },
          children: titleChildren,
        });
      } else {
        data.hName = "aside";
        data.hProperties = {
          class: `callout callout-${kind}`,
          role: "note",
          "data-callout": kind,
        };
        directive.children.unshift({
          type: "paragraph",
          data: { hName: "div", hProperties: { class: "callout-title" } },
          children: titleChildren,
        });
      }
    });
  };
};

export default remarkCallouts;
