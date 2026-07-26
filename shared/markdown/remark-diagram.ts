import type { ElementContent } from "hast";
import type { Code, Parent, Root } from "mdast";
import type { Plugin, Transformer } from "unified";
import { visit } from "unist-util-visit";

/**
 * Shared core of the remark mermaid and drawio plugins. The code block and
 * directive walking, the source extraction, the base64 encoding and the node
 * replacement mechanics live here; the markup factories stay in the variant
 * adapters because every toolbar is variant specific down to its hooks and
 * icon geometry. Three replacement mechanisms exist in the historical forks
 * and each must be kept as is: a fresh element node (most variants), a raw
 * HTML string (cult-ui, motion-primitives), and hast data grafted onto the
 * code node itself, which the markdown pipeline then wraps in a pre tag
 * (organique). The rendered HTML must stay byte for byte identical.
 */

/* Icon geometry shared by several toolbars. */

export const DIAGRAM_RESET_PATHS = [
  "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
  "M3 3v5h5",
] as const;

export const DIAGRAM_SPINNER_PATH = "M21 12a9 9 0 1 1-6.219-8.56";

export const DIAGRAM_COPY_PATH = "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1";

export const DIAGRAM_MAGNIFIER_PATH = "m21 21-4.3-4.3";

interface FileLike {
  path?: string;
  history?: string[];
}

interface MdNode {
  type: string;
  name?: string;
  value?: string;
  attributes?: Record<string, string | null | undefined>;
  children?: unknown[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: ElementContent[];
    directiveLabel?: boolean;
  };
}

/* Mermaid: fenced code blocks with the mermaid language. */

export interface MermaidContext<L extends string> {
  code: string;
  /** The source encoded in base64 for the client runtime. */
  encoded: string;
  locale: L;
}

export type MermaidReplacement =
  | {
      /** Replace the code block with a fresh element-producing node. */
      kind: "element";
      /** mdast type of the replacement, kept per variant for any later
       * remark plugin that inspects node types. */
      nodeType: string;
      hName: string;
      hProperties: Record<string, unknown>;
      hChildren: ElementContent[];
    }
  | {
      /** Turn the code block into a raw HTML node in place. */
      kind: "html";
      value: string;
    }
  | {
      /** Graft hast data onto the code node itself; the code handler then
       * wraps the result in a pre tag (organique). */
      kind: "code-data";
      hName: string;
      hProperties: Record<string, unknown>;
      hChildren: ElementContent[];
    };

export interface RemarkMermaidOptions<L extends string> {
  /** Locale resolution from the processed file; labels stay in the adapter. */
  locale: (file: FileLike | undefined) => L;
  /** Lowercase the language before matching (_core). */
  lowercaseLang?: boolean;
  /** Markup factory of the variant. */
  render: (context: MermaidContext<L>) => MermaidReplacement;
}

export const createRemarkMermaid = <L extends string>(
  options: RemarkMermaidOptions<L>,
): Plugin<[], Root> => {
  return () => {
    const transformer: Transformer<Root> = (tree, file) => {
      const locale = options.locale(file as FileLike | undefined);

      visit(tree, "code", (node: Code, index: number | undefined, parent: Parent | undefined) => {
        const lang = options.lowercaseLang ? (node.lang ?? "").toLowerCase() : node.lang;
        if (lang !== "mermaid") return;

        const code = node.value ?? "";
        const encoded = Buffer.from(code, "utf-8").toString("base64");
        const replacement = options.render({ code, encoded, locale });

        if (replacement.kind === "html") {
          const html = node as unknown as { type: string; value: string };
          html.type = "html";
          html.value = replacement.value;
          return;
        }

        if (replacement.kind === "code-data") {
          const target = node as unknown as MdNode;
          const data = target.data ?? (target.data = {});
          data.hName = replacement.hName;
          data.hProperties = replacement.hProperties;
          data.hChildren = replacement.hChildren;
          return;
        }

        if (!parent || typeof index !== "number") return;
        parent.children[index] = {
          type: replacement.nodeType,
          children: [],
          data: {
            hName: replacement.hName,
            hProperties: replacement.hProperties,
            hChildren: replacement.hChildren,
          },
        } as unknown as (typeof parent.children)[number];
      });
    };

    return transformer;
  };
};

/* Drawio: container directives named drawio. */

export interface DrawioContext<L extends string> {
  /** Raw src attribute; each adapter applies its own fallback. */
  src: string | null | undefined;
  /** Raw title attribute; each adapter applies its own fallback. */
  title: string | null | undefined;
  locale: L;
  /** Directive children, without the label when stripLabel is set. */
  body: unknown[];
}

export interface DrawioResult {
  hName: string;
  hProperties: Record<string, unknown>;
  hChildren?: ElementContent[];
  /** New mdast children; omit to leave the directive children untouched. */
  children?: unknown[];
}

export interface RemarkDrawioOptions<L extends string> {
  /** Locale resolution from the processed file; labels stay in the adapter. */
  locale: (file: FileLike | undefined) => L;
  /** Remove a leading directive label from the body (_core, aceternity). */
  stripLabel?: boolean;
  /** Markup factory of the variant. */
  render: (context: DrawioContext<L>) => DrawioResult;
}

export const createRemarkDrawio = <L extends string>(
  options: RemarkDrawioOptions<L>,
): Plugin<[], Root> => {
  return () => {
    const transformer: Transformer<Root> = (tree, file) => {
      const locale = options.locale(file as FileLike | undefined);

      visit(tree, (node) => {
        const directive = node as unknown as MdNode;
        if (directive.type !== "containerDirective" || directive.name !== "drawio") return;

        const children = (directive.children ?? []) as MdNode[];
        const body =
          options.stripLabel && children[0]?.data?.directiveLabel ? children.slice(1) : children;

        const result = options.render({
          src: directive.attributes?.src,
          title: directive.attributes?.title,
          locale,
          body,
        });

        const data = directive.data ?? (directive.data = {});
        data.hName = result.hName;
        data.hProperties = result.hProperties;
        if (result.hChildren !== undefined) data.hChildren = result.hChildren;
        if (result.children !== undefined) directive.children = result.children;
      });
    };

    return transformer;
  };
};
