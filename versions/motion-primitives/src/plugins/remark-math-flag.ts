import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const remarkMathFlag: Plugin<[], Root> = () => {
  return (tree, file) => {
    let hasMath = false;
    visit(tree, (node) => {
      if (node.type === "math" || node.type === "inlineMath") {
        hasMath = true;
      }
    });
    if (!hasMath) return;
    const data = file.data as { astro?: { frontmatter?: Record<string, unknown> } };
    data.astro ??= {};
    data.astro.frontmatter ??= {};
    data.astro.frontmatter.hasMath = true;
  };
};

export default remarkMathFlag;
