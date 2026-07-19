interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function visit(node: HastNode): void {
  if (
    node.type === "element" &&
    node.tagName === "input" &&
    node.properties?.type === "checkbox" &&
    node.properties?.disabled !== undefined
  ) {
    node.properties.ariaHidden = "true";
  }
  for (const child of node.children ?? []) {
    visit(child);
  }
}

export function rehypeTaskCheckboxes() {
  return (tree: HastNode) => {
    visit(tree);
  };
}
