import { describe, expect, it } from "bun:test";
import type { Element, Root, Text } from "hast";
import { h } from "hastscript";
import { visit } from "unist-util-visit";
import {
  classicLinkIcon,
  createRehypeHeadingAnchors,
  HEADING_LINK_PATHS,
  headingTextContent,
  type RehypeHeadingAnchorsOptions,
} from "../../shared/markdown/rehype-heading-anchors";
import { localeFromPath, mdToHtmlRehype } from "./helpers";

// Simulates rehypeHeadingIds, which runs upstream of the anchors in every
// variant except _core: ids are slugged from the text, lowercased, dashed.
const assignIds = () => (tree: Root) => {
  visit(tree, "element", (node: Element) => {
    if (!/^h[1-6]$/.test(node.tagName)) return;
    let text = "";
    visit(node, "text", (child: Text) => {
      text += child.value;
    });
    node.properties = node.properties ?? {};
    node.properties.id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });
};

const labels = { fr: "Lien vers la section", en: "Link to section" };

const base: RehypeHeadingAnchorsOptions<"fr" | "en"> = {
  locale: localeFromPath,
  anchor: (id, locale) =>
    h("a", { class: "heading-anchor", href: `#${id}`, "aria-label": labels[locale] }, [
      classicLinkIcon(),
    ]),
};

describe("createRehypeHeadingAnchors", () => {
  it("appends an anchor to h2 h3 h4 and leaves h1 h5 alone", async () => {
    const html = await mdToHtmlRehype("# T\n\n## Deux\n\n### Trois\n\n#### Quatre\n\n##### Cinq", [
      assignIds,
      createRehypeHeadingAnchors(base),
    ]);
    expect(html).toContain('<h1 id="t">T</h1>');
    expect(html).toContain('<h2 id="deux">Deux<a class="heading-anchor" href="#deux"');
    expect(html).toContain('<h3 id="trois">Trois<a class="heading-anchor" href="#trois"');
    expect(html).toContain('<h4 id="quatre">Quatre<a class="heading-anchor" href="#quatre"');
    expect(html).toContain('<h5 id="cinq">Cinq</h5>');
  });

  it("serializes the shared chain icon with the exact attribute order", async () => {
    const html = await mdToHtmlRehype("## Un", [assignIds, createRehypeHeadingAnchors(base)]);
    expect(html).toContain(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        `<path d="${HEADING_LINK_PATHS[0]}"></path><path d="${HEADING_LINK_PATHS[1]}"></path></svg>`,
    );
  });

  it("localizes the anchor label from the file path", async () => {
    const en = await mdToHtmlRehype(
      "## My section",
      [assignIds, createRehypeHeadingAnchors(base)],
      "/content/blog/en/post.mdx",
    );
    expect(en).toContain('aria-label="Link to section"');
  });

  it("skips headings without an id, unless allowEmptyId keeps empty ones", async () => {
    const skipped = await mdToHtmlRehype("## ---", [assignIds, createRehypeHeadingAnchors(base)]);
    expect(skipped).not.toContain("heading-anchor");

    const kept = await mdToHtmlRehype("## ---", [
      assignIds,
      createRehypeHeadingAnchors({ ...base, allowEmptyId: true }),
    ]);
    expect(kept).toContain('<h2 id="">---<a class="heading-anchor" href="#"');
  });

  it("honors the shouldAnchor re-entrance guard", async () => {
    const html = await mdToHtmlRehype("## Deux", [
      assignIds,
      createRehypeHeadingAnchors({
        ...base,
        shouldAnchor: (node) =>
          !(node.children ?? []).some((child) => child.type === "element" && child.tagName === "a"),
      }),
      createRehypeHeadingAnchors({
        ...base,
        shouldAnchor: (node) =>
          !(node.children ?? []).some((child) => child.type === "element" && child.tagName === "a"),
      }),
    ]);
    expect(html.match(/heading-anchor/g)?.length).toBe(1);
  });

  it("prepends the anchor and applies decorate when configured", async () => {
    const html = await mdToHtmlRehype("## Deux", [
      assignIds,
      createRehypeHeadingAnchors({
        ...base,
        position: "prepend",
        decorate: (node) => {
          node.properties = { ...node.properties, class: "group heading" };
        },
      }),
    ]);
    expect(html).toContain(
      '<h2 id="deux" class="group heading"><a class="heading-anchor" href="#deux"',
    );
    expect(html).toContain("</a>Deux</h2>");
  });

  it("passes the heading node so anchors can compose their label", async () => {
    const html = await mdToHtmlRehype("## Ma section", [
      assignIds,
      createRehypeHeadingAnchors({
        ...base,
        anchor: (id, _locale, node) =>
          h("a", { href: `#${id}`, "aria-label": `Lien: ${headingTextContent(node)}` }),
      }),
    ]);
    expect(html).toContain('aria-label="Lien: Ma section"');
  });

  describe("slugMissingIds (_core)", () => {
    const options = { ...base, slugMissingIds: true };

    it("slugs every heading level and only anchors h2 to h4", async () => {
      const html = await mdToHtmlRehype("# Titre haut\n\n## Section un\n\n###### Bas", [
        createRehypeHeadingAnchors(options),
      ]);
      expect(html).toContain('<h1 id="titre-haut">Titre haut</h1>');
      expect(html).toContain('<h2 id="section-un">Section un<a class="heading-anchor"');
      expect(html).toContain('<h6 id="bas">Bas</h6>');
    });

    it("deduplicates repeated slugs like GithubSlugger", async () => {
      const html = await mdToHtmlRehype("## Pareil\n\n## Pareil", [
        createRehypeHeadingAnchors(options),
      ]);
      expect(html).toContain('<h2 id="pareil">');
      expect(html).toContain('<h2 id="pareil-1">');
    });

    it("keeps ids that already exist", async () => {
      const withId = () => (tree: Root) => {
        visit(tree, "element", (node: Element) => {
          if (node.tagName === "h2") {
            node.properties = { ...node.properties, id: "figé" };
          }
        });
      };
      const html = await mdToHtmlRehype("## Autre nom", [
        withId,
        createRehypeHeadingAnchors(options),
      ]);
      expect(html).toContain('<h2 id="figé">Autre nom<a class="heading-anchor" href="#figé"');
    });
  });
});
