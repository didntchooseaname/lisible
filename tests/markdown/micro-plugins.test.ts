import { describe, expect, it } from "bun:test";
import { rehypeTaskCheckboxes } from "../../shared/markdown/rehype-task-checkboxes";
import remarkMathFlag from "../../shared/markdown/remark-math-flag";

describe("remarkMathFlag", () => {
  const run = (tree: { type?: string; children?: unknown[] }) => {
    const file = { data: {} as { astro?: { frontmatter?: Record<string, unknown> } } };
    remarkMathFlag()(tree as never, file as never);
    return file.data;
  };

  it("flags trees containing math or inlineMath nodes", () => {
    expect(run({ type: "root", children: [{ type: "math" }] })).toEqual({
      astro: { frontmatter: { hasMath: true } },
    });
    expect(
      run({
        type: "root",
        children: [{ type: "paragraph", children: [{ type: "inlineMath" }] }],
      }),
    ).toEqual({ astro: { frontmatter: { hasMath: true } } });
  });

  it("leaves the file data untouched without math", () => {
    expect(run({ type: "root", children: [{ type: "paragraph", children: [] }] })).toEqual({});
  });
});

describe("rehypeTaskCheckboxes", () => {
  it("hides disabled task checkboxes from the accessibility tree", () => {
    const input = {
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", disabled: true },
      children: [],
    };
    const tree = {
      type: "root",
      children: [{ type: "element", tagName: "li", children: [input] }],
    };
    rehypeTaskCheckboxes()(tree as never);
    expect(input.properties).toEqual({ type: "checkbox", disabled: true, ariaHidden: "true" });
  });

  it("ignores enabled checkboxes and other inputs", () => {
    const enabled = {
      type: "element",
      tagName: "input",
      properties: { type: "checkbox" },
      children: [],
    };
    const text = {
      type: "element",
      tagName: "input",
      properties: { type: "text", disabled: true },
      children: [],
    };
    const tree = { type: "root", children: [enabled, text] };
    rehypeTaskCheckboxes()(tree as never);
    expect(enabled.properties).toEqual({ type: "checkbox" });
    expect(text.properties).toEqual({ type: "text", disabled: true });
  });
});
