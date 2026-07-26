import GithubSlugger from "github-slugger";
import type { Element, Root, Text } from "hast";
import { h } from "hastscript";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";
import { STROKE_ICON_ATTRS } from "./remark-callouts";

/**
 * Shared core of the rehype heading anchors plugin. The tree walking, the id
 * sourcing and the anchor insertion live here; every variant keeps its exact
 * markup contract (heading classes, anchor attributes and their order, icon
 * geometry, aria labels) through options. Labels are injected by the adapters
 * because each variant has its own i18n source. The rendered HTML must stay
 * byte for byte identical to the historical forks.
 */

/** The two path strokes of the chain link icon, shared by every variant. */
export const HEADING_LINK_PATHS = [
  "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
  "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
] as const;

/** The 16 by 16 stroke icon shared by the _core and organique anchors. */
export const classicLinkIcon = (): Element =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: "16",
      height: "16",
      ...STROKE_ICON_ATTRS,
    },
    HEADING_LINK_PATHS.map((d) => h("path", { d })),
  );

/** Headings that receive an anchor link. */
const ANCHORED = new Set(["h2", "h3", "h4"]);

/** Headings that receive an id in self slugging mode (_core). */
const SLUGGED = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function headingTextContent(node: Element): string {
  let out = "";
  visit(node, "text", (text: Text) => {
    out += text.value;
  });
  return out;
}

interface FileLike {
  path?: string;
  history?: string[];
}

export interface RehypeHeadingAnchorsOptions<L extends string> {
  /** Locale resolution from the processed file; labels stay in the adapter. */
  locale: (file: FileLike | undefined) => L;
  /** Slug missing ids with GithubSlugger on h1 to h6, for the variant that
   * does not run rehypeHeadingIds upstream (_core). */
  slugMissingIds?: boolean;
  /** Keep anchoring headings whose id is the empty string (reactbits). */
  allowEmptyId?: boolean;
  /** Re-entrance guard: return false to leave the heading untouched. */
  shouldAnchor?: (node: Element) => boolean;
  /** Heading mutation before insertion: classes and data flags, in the exact
   * shape the variant historically produced. */
  decorate?: (node: Element) => void;
  /** Where the anchor goes among the heading children. */
  position?: "append" | "prepend";
  /** Builds the anchor element; the heading is passed for label composition. */
  anchor: (id: string, locale: L, node: Element) => Element;
}

export const createRehypeHeadingAnchors = <L extends string>(
  options: RehypeHeadingAnchorsOptions<L>,
): Plugin<[], Root> => {
  return () => {
    const transformer: Transformer<Root> = (tree, file) => {
      const locale = options.locale(file as FileLike | undefined);
      const slugger = options.slugMissingIds ? new GithubSlugger() : null;

      visit(tree, "element", (node: Element) => {
        if (!(slugger ? SLUGGED : ANCHORED).has(node.tagName)) return;

        if (slugger) {
          node.properties = node.properties ?? {};
          if (typeof node.properties.id !== "string") {
            node.properties.id = slugger.slug(headingTextContent(node));
          }
          if (!ANCHORED.has(node.tagName)) return;
        }

        const id = node.properties?.id;
        if (typeof id !== "string") return;
        if (id.length === 0 && !options.allowEmptyId) return;
        if (options.shouldAnchor && !options.shouldAnchor(node)) return;

        options.decorate?.(node);

        const anchor = options.anchor(id, locale, node);
        if (options.position === "prepend") node.children.unshift(anchor);
        else node.children.push(anchor);
      });
    };

    return transformer;
  };
};
