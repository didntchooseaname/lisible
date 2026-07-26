import type { ElementContent } from "hast";
import { h } from "hastscript";
import type { Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";

/**
 * Shared core of the remark callouts plugin. The directive walking, the
 * collapse detection and the label extraction live here; every variant keeps
 * its exact markup contract (root tag, class naming, header shape, icon
 * geometry, attribute order) through options. Titles are injected by the
 * adapters because each variant has its own i18n source. The rendered HTML
 * must stay byte for byte identical to the historical forks.
 */

export const CALLOUT_VARIANTS = ["note", "tip", "warning", "caution", "important"] as const;

export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

/* Icon geometry shared by most variants. The families that deviate (h4x0r's
 * open warning triangle, cult-ui's hexagon, motion-primitives' shield) keep
 * their own strings in their adapter. */

export const CALLOUT_TIP_PATHS = [
  "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
  "M9 18h6",
  "M10 22h4",
] as const;

export const CALLOUT_WARNING_PATHS = [
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
  "M12 9v4",
  "M12 17h.01",
] as const;

export const CALLOUT_OCTAGON_PATH =
  "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z";

export const CALLOUT_BUBBLE_PATH = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";

export const CALLOUT_CHEVRON_PATH = "m6 9 6 6 6-6";

/** Presentation attributes shared by every stroke icon, in the order every
 * variant serializes them: fill, stroke, widths, caps, aria-hidden. */
export const STROKE_ICON_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

/**
 * How the optional `:::note[Label]` directive label becomes the title.
 *
 * - "inline": keep the label's inline mdast children so markdown formatting
 *   survives (_core).
 * - "deep-text": concatenate every nested value, trim, fall back to the
 *   default title when empty (aceternity, h4x0r, organique).
 * - "text-nodes": concatenate text descendants of a label paragraph found
 *   anywhere among the children, untrimmed, "" falls back (cult-ui).
 * - "shallow-text": concatenate direct child values, trim, fall back when
 *   empty (reactbits).
 * - "shallow-raw": concatenate direct child values, untrimmed, used even when
 *   empty (motion-primitives).
 */
export type CalloutLabelMode =
  | "inline"
  | "deep-text"
  | "text-nodes"
  | "shallow-text"
  | "shallow-raw";

export type CalloutHeader =
  | {
      /** icon, then a span holding the title text, then an optional chevron
       * on collapsible callouts, all emitted as hast. */
      kind: "hast";
      icon: (variant: CalloutVariant) => ElementContent;
      titleClass: string;
      chevron?: () => ElementContent;
    }
  | {
      /** raw HTML icon followed by a bare text title; the icon string passes
       * through markdown's raw HTML handling (motion-primitives). */
      kind: "raw";
      icon: (variant: CalloutVariant) => string;
    }
  | {
      /** span wrapped icon and chevron around an inline mdast title (_core);
       * requires the "inline" label mode. */
      kind: "wrapped";
      icon: (variant: CalloutVariant) => ElementContent;
      iconWrapClass: string;
      titleClass: string;
      chevron: () => ElementContent;
      chevronWrapClass: string;
    };

export interface CalloutMarkup {
  /** Tag of the non collapsible root; collapsible roots are always details. */
  staticTag: "div" | "aside";
  /** Separator of the per type root class: callout-note vs callout--note. */
  classSeparator?: "-" | "--";
  /** Append " callout-collapsible" to the root class when collapsible. */
  collapsibleClass?: boolean;
  /** Root properties serialized after class, in exact order (data-callout,
   * role="note" on static roots, both, or none). */
  rootExtras?: (variant: CalloutVariant, collapsible: boolean) => Record<string, unknown>;
  /** Tag of the non collapsible header; collapsible headers are summary. */
  headerStaticTag?: "div" | "p";
  headerClass: string;
  /** Wrap the remaining children in a div.callout-body. */
  wrapBody?: boolean;
  header: CalloutHeader;
}

interface MdNode {
  type: string;
  name?: string;
  value?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: MdNode[];
  data?: {
    directiveLabel?: boolean;
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
  };
}

interface FileLike {
  path?: string;
  history?: string[];
}

export interface RemarkCalloutsOptions<L extends string> {
  /** Locale resolution from the processed file; titles stay in the adapter. */
  locale: (file: FileLike | undefined) => L;
  /** Default title of a callout without label, from the variant's i18n. */
  title: (locale: L, variant: CalloutVariant) => string;
  labelMode?: CalloutLabelMode;
  markup: CalloutMarkup;
}

const deepText = (node: MdNode): string => {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(deepText).join("");
};

const shallowText = (node: MdNode): string =>
  (node.children ?? []).map((child) => child.value ?? "").join("");

const textNodesValue = (node: MdNode): string => {
  let out = "";
  visit(node as unknown as Root, "text", (text) => {
    out += text.value;
  });
  return out;
};

export const createRemarkCallouts = <L extends string>(
  options: RemarkCalloutsOptions<L>,
): Plugin<[], Root> => {
  const { markup } = options;
  const mode = options.labelMode ?? "deep-text";
  const variants = new Set<string>(CALLOUT_VARIANTS);

  return () => {
    const transformer: Transformer<Root> = (tree, file) => {
      const locale = options.locale(file as FileLike | undefined);

      visit(tree, (node) => {
        const directive = node as unknown as MdNode;
        if (directive.type !== "containerDirective") return;
        const variant = directive.name as CalloutVariant;
        if (!variant || !variants.has(variant)) return;

        const collapsible = directive.attributes != null && "collapse" in directive.attributes;

        let body = directive.children ?? [];
        let title = options.title(locale, variant);
        let titleInline: MdNode[] = [{ type: "text", value: title }];

        if (mode === "text-nodes") {
          body = [...body];
          const index = body.findIndex(
            (child) => child.type === "paragraph" && child.data?.directiveLabel,
          );
          if (index !== -1) {
            title = textNodesValue(body[index]) || title;
            body.splice(index, 1);
          }
        } else {
          const first = body[0];
          if (first?.data?.directiveLabel) {
            body = body.slice(1);
            if (mode === "inline") {
              titleInline = first.children ?? [];
            } else if (mode === "shallow-raw") {
              title = shallowText(first);
            } else {
              const text = (mode === "shallow-text" ? shallowText(first) : deepText(first)).trim();
              if (text) title = text;
            }
          }
        }

        const headerTag = collapsible ? "summary" : (markup.headerStaticTag ?? "div");
        let header: MdNode;
        if (markup.header.kind === "raw") {
          header = {
            type: "paragraph",
            data: { hName: headerTag, hProperties: { class: markup.headerClass } },
            children: [
              { type: "html", value: markup.header.icon(variant) },
              { type: "text", value: title },
            ],
          };
        } else if (markup.header.kind === "wrapped") {
          const parts: MdNode[] = [
            {
              type: "calloutIcon",
              data: {
                hName: "span",
                hProperties: { class: markup.header.iconWrapClass },
                hChildren: [markup.header.icon(variant)],
              },
              children: [],
            },
            {
              type: "calloutTitle",
              data: { hName: "span", hProperties: { class: markup.header.titleClass } },
              children: titleInline,
            },
          ];
          if (collapsible) {
            parts.push({
              type: "calloutChevron",
              data: {
                hName: "span",
                hProperties: { class: markup.header.chevronWrapClass },
                hChildren: [markup.header.chevron()],
              },
              children: [],
            });
          }
          header = {
            type: "calloutHeader",
            data: { hName: headerTag, hProperties: { class: markup.headerClass } },
            children: parts,
          };
        } else {
          const parts: ElementContent[] = [
            markup.header.icon(variant),
            h("span", { class: markup.header.titleClass }, title),
          ];
          if (collapsible && markup.header.chevron) parts.push(markup.header.chevron());
          header = {
            type: "paragraph",
            data: {
              hName: headerTag,
              hProperties: { class: markup.headerClass },
              hChildren: parts,
            },
            children: [],
          };
        }

        const content = markup.wrapBody
          ? [
              {
                type: "calloutBody",
                data: { hName: "div", hProperties: { class: "callout-body" } },
                children: body,
              },
            ]
          : body;

        let rootClass = `callout callout${markup.classSeparator ?? "-"}${variant}`;
        if (collapsible && markup.collapsibleClass) rootClass += " callout-collapsible";

        const data = directive.data ?? (directive.data = {});
        data.hName = collapsible ? "details" : markup.staticTag;
        data.hProperties = {
          class: rootClass,
          ...(markup.rootExtras?.(variant, collapsible) ?? {}),
        };
        directive.children = [header, ...content];
      });
    };

    return transformer;
  };
};
