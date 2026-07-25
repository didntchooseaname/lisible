type MdastNode = {
  type?: string;
  children?: MdastNode[];
};

type VFileLike = {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
};

/** shared/ has no node_modules, so it stays free of runtime dependencies. */
function walk(node: MdastNode, visitor: (node: MdastNode) => void): void {
  visitor(node);
  for (const child of node.children ?? []) walk(child, visitor);
}

/**
 * Flags posts that contain math so the layout can load the KaTeX stylesheet
 * only on the pages that need it.
 */
const remarkMathFlag = () => {
  return (tree: MdastNode, file: VFileLike) => {
    let hasMath = false;
    walk(tree, (node) => {
      if (node.type === "math" || node.type === "inlineMath") {
        hasMath = true;
      }
    });
    if (!hasMath) return;
    const data = file.data;
    data.astro ??= {};
    data.astro.frontmatter ??= {};
    data.astro.frontmatter.hasMath = true;
  };
};

export default remarkMathFlag;
