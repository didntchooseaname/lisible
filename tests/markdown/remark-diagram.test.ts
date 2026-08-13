import { describe, expect, it } from "bun:test";
import { h } from "hastscript";
import {
  createRemarkDrawio,
  createRemarkMermaid,
  type DrawioContext,
  type MermaidContext,
} from "../../shared/markdown/remark-diagram";
import { localeFromPath, mdToHtml } from "./helpers";

const MERMAID_BLOCK = "```mermaid\nflowchart LR\n  A --> B\n```";
const MERMAID_SOURCE = "flowchart LR\n  A --> B";
const ENCODED = Buffer.from(MERMAID_SOURCE, "utf-8").toString("base64");

describe("createRemarkMermaid", () => {
  it("replaces the code block with a fresh element node", async () => {
    const seen: Array<MermaidContext<"fr" | "en">> = [];
    const html = await mdToHtml(MERMAID_BLOCK, [
      createRemarkMermaid({
        locale: localeFromPath,
        render: (context) => {
          seen.push(context);
          return {
            kind: "element",
            nodeType: "mermaidBlock",
            hName: "div",
            hProperties: { class: "mermaid-wrap", "data-code": context.encoded },
            hChildren: [h("pre", { class: "mermaid-source", hidden: true }, context.code)],
          };
        },
      }),
    ]);
    expect(seen).toEqual([{ code: MERMAID_SOURCE, encoded: ENCODED, locale: "fr" }]);
    expect(html).toBe(
      `<div class="mermaid-wrap" data-code="${ENCODED}">` +
        `<pre class="mermaid-source" hidden>${MERMAID_SOURCE}</pre></div>`,
    );
  });

  it("turns the code block into raw HTML in place", async () => {
    const html = await mdToHtml(MERMAID_BLOCK, [
      createRemarkMermaid({
        locale: localeFromPath,
        render: ({ encoded }) => ({
          kind: "html",
          value: `<div class="mermaid" data-source="${encoded}"></div>`,
        }),
      }),
    ]);
    expect(html).toBe(`<div class="mermaid" data-source="${ENCODED}"></div>`);
  });

  it("grafts hast data onto the code node, wrapped in a pre (organique)", async () => {
    const html = await mdToHtml(MERMAID_BLOCK, [
      createRemarkMermaid({
        locale: localeFromPath,
        render: ({ code, encoded }) => ({
          kind: "code-data",
          hName: "div",
          hProperties: { "data-diagram": "outer" },
          hChildren: [h("pre", { class: "diagram-source", "data-mermaid-source": encoded }, code)],
        }),
      }),
    ]);
    expect(html).toBe(
      '<pre><div class="language-mermaid" data-diagram="outer">' +
        `<pre class="diagram-source" data-mermaid-source="${ENCODED}">${MERMAID_SOURCE}</pre>` +
        "</div></pre>",
    );
  });

  it("matches the language case sensitively unless lowercaseLang is set", async () => {
    const upper = "```MERMAID\nA\n```";
    const render = () => ({ kind: "html", value: "<div>matched</div>" }) as const;

    const untouched = await mdToHtml(upper, [
      createRemarkMermaid({ locale: localeFromPath, render }),
    ]);
    expect(untouched).toContain("<code");
    expect(untouched).not.toContain("matched");

    const matched = await mdToHtml(upper, [
      createRemarkMermaid({ locale: localeFromPath, lowercaseLang: true, render }),
    ]);
    expect(matched).toBe("<div>matched</div>");
  });

  it("leaves other code blocks alone", async () => {
    const html = await mdToHtml("```js\nconsole.log(1);\n```", [
      createRemarkMermaid({
        locale: localeFromPath,
        render: () => ({ kind: "html", value: "<div>nope</div>" }),
      }),
    ]);
    expect(html).toContain("language-js");
    expect(html).not.toContain("nope");
  });

  it("resolves the locale for the render context", async () => {
    let locale = "";
    await mdToHtml(
      MERMAID_BLOCK,
      [
        createRemarkMermaid({
          locale: localeFromPath,
          render: (context) => {
            locale = context.locale;
            return { kind: "html", value: "<div></div>" };
          },
        }),
      ],
      "/content/blog/en/post.mdx",
    );
    expect(locale).toBe("en");
  });
});

describe("createRemarkDrawio", () => {
  const collect = (options: { stripLabel?: boolean } = {}) => {
    const seen: Array<DrawioContext<"fr" | "en">> = [];
    const plugin = createRemarkDrawio({
      locale: localeFromPath,
      stripLabel: options.stripLabel,
      render: (context) => {
        seen.push(context);
        return {
          hName: "figure",
          hProperties: { class: "drawio", "data-src": context.src ?? "" },
        };
      },
    });
    return { seen, plugin };
  };

  it("passes the raw src and title attributes, without fallbacks", async () => {
    const { seen, plugin } = collect();
    await mdToHtml(':::drawio{src="/diagrams/archi.drawio" title="Archi"}\nLégende.\n:::', [
      plugin,
    ]);
    expect(seen).toHaveLength(1);
    expect(seen[0].src).toBe("/diagrams/archi.drawio");
    expect(seen[0].title).toBe("Archi");

    const bare = collect();
    await mdToHtml(":::drawio\nx\n:::", [bare.plugin]);
    expect(bare.seen[0].src).toBeUndefined();
    expect(bare.seen[0].title).toBeUndefined();
  });

  it("keeps the directive children unless the render result replaces them", async () => {
    const html = await mdToHtml(':::drawio{src="/d.drawio"}\nLégende.\n:::', [
      createRemarkDrawio({
        locale: localeFromPath,
        render: ({ src }) => ({ hName: "figure", hProperties: { "data-src": src ?? "" } }),
      }),
    ]);
    expect(html).toBe('<figure data-src="/d.drawio"><p>Légende.</p></figure>');
  });

  it("replaces children and hChildren when provided", async () => {
    const html = await mdToHtml(':::drawio{src="/d.drawio"}\nLégende.\n:::', [
      createRemarkDrawio({
        locale: localeFromPath,
        render: () => ({
          hName: "div",
          hProperties: { class: "drawio-wrap" },
          hChildren: [h("span", { class: "drawio-hint" }, "hint")],
          children: [],
        }),
      }),
    ]);
    expect(html).toBe('<div class="drawio-wrap"><span class="drawio-hint">hint</span></div>');
  });

  it("strips a leading label only when stripLabel is set", async () => {
    const md = ':::drawio[Un label]{src="/d.drawio"}\nCorps.\n:::';

    const kept = collect();
    await mdToHtml(md, [kept.plugin]);
    expect(kept.seen[0].body).toHaveLength(2);

    const stripped = collect({ stripLabel: true });
    await mdToHtml(md, [stripped.plugin]);
    expect(stripped.seen[0].body).toHaveLength(1);
  });

  it("ignores other container directives", async () => {
    const { seen, plugin } = collect();
    await mdToHtml(":::note\nx\n:::", [plugin]);
    expect(seen).toHaveLength(0);
  });
});
