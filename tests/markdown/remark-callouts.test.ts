import { describe, expect, it } from "bun:test";
import { h } from "hastscript";
import {
  CALLOUT_CHEVRON_PATH,
  type CalloutVariant,
  createRemarkCallouts,
  type RemarkCalloutsOptions,
  STROKE_ICON_ATTRS,
} from "../../shared/markdown/remark-callouts";
import { localeFromPath, mdToHtml } from "./helpers";

// Compact stand-ins for the variant icon sets: one path per variant is enough
// to assert placement and attribute order without dragging the full geometry.
const icon = (variant: CalloutVariant) =>
  h("svg", { viewBox: "0 0 24 24", width: "18", height: "18", ...STROKE_ICON_ATTRS }, [
    h("path", { d: `icon-${variant}` }),
  ]);

const chevron = () =>
  h("svg", { viewBox: "0 0 24 24", width: "16", height: "16", ...STROKE_ICON_ATTRS }, [
    h("path", { d: CALLOUT_CHEVRON_PATH }),
  ]);

const titles: Record<"fr" | "en", Record<CalloutVariant, string>> = {
  fr: {
    note: "Note",
    tip: "Astuce",
    warning: "Attention",
    caution: "Prudence",
    important: "Important",
  },
  en: { note: "Note", tip: "Tip", warning: "Warning", caution: "Caution", important: "Important" },
};

const base: RemarkCalloutsOptions<"fr" | "en"> = {
  locale: localeFromPath,
  title: (locale, variant) => titles[locale][variant],
  markup: {
    staticTag: "div",
    headerClass: "callout-header",
    header: { kind: "hast", icon, titleClass: "callout-title", chevron },
  },
};

const render = (
  md: string,
  options: Partial<RemarkCalloutsOptions<"fr" | "en">> = {},
  path?: string,
) => mdToHtml(md, [createRemarkCallouts({ ...base, ...options })], path);

describe("createRemarkCallouts", () => {
  it("renders a static callout with the default localized title", async () => {
    const html = await render(":::note\nCorps du texte.\n:::");
    expect(html).toBe(
      '<div class="callout callout-note">' +
        '<div class="callout-header">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="icon-note"></path></svg>' +
        '<span class="callout-title">Note</span>' +
        "</div>" +
        "<p>Corps du texte.</p>" +
        "</div>",
    );
  });

  it("resolves the locale from the file path", async () => {
    const fr = await render(":::tip\nx\n:::", {}, "/content/blog/fr/post.mdx");
    const en = await render(":::tip\nx\n:::", {}, "/content/blog/en/post.mdx");
    expect(fr).toContain(">Astuce<");
    expect(en).toContain(">Tip<");
  });

  it("ignores directives outside the callout set", async () => {
    const html = await render(":::spoiler\nx\n:::");
    expect(html).not.toContain("callout");
  });

  it("turns the collapse attribute into details and summary", async () => {
    const html = await render(":::warning{collapse}\nx\n:::");
    expect(html).toStartWith('<details class="callout callout-warning">');
    expect(html).toContain('<summary class="callout-header">');
    expect(html).toContain(`d="${CALLOUT_CHEVRON_PATH}"`);
  });

  it("keeps the chevron out of static callouts", async () => {
    const html = await render(":::warning\nx\n:::");
    expect(html).not.toContain(`d="${CALLOUT_CHEVRON_PATH}"`);
  });

  it("appends the collapsible class when configured", async () => {
    const options = { markup: { ...base.markup, collapsibleClass: true } };
    expect(await render(":::note{collapse}\nx\n:::", options)).toContain(
      'class="callout callout-note callout-collapsible"',
    );
    expect(await render(":::note\nx\n:::", options)).toContain('class="callout callout-note"');
  });

  it("uses the double dash class separator", async () => {
    const html = await render(":::caution\nx\n:::", {
      markup: { ...base.markup, classSeparator: "--" },
    });
    expect(html).toContain('class="callout callout--caution"');
  });

  it("serializes rootExtras in insertion order after the class", async () => {
    const noteFirst = await render(":::note\nx\n:::", {
      markup: {
        ...base.markup,
        rootExtras: () => ({ role: "note", "data-callout": "note" }),
      },
    });
    expect(noteFirst).toStartWith(
      '<div class="callout callout-note" role="note" data-callout="note">',
    );

    const dataFirst = await render(":::note\nx\n:::", {
      markup: {
        ...base.markup,
        rootExtras: (variant) => ({ "data-callout": variant, role: "note" }),
      },
    });
    expect(dataFirst).toStartWith(
      '<div class="callout callout-note" data-callout="note" role="note">',
    );
  });

  it("renders aside roots and p headers when configured", async () => {
    const html = await render(":::important\nx\n:::", {
      markup: { ...base.markup, staticTag: "aside", headerStaticTag: "p" },
    });
    expect(html).toStartWith('<aside class="callout callout-important">');
    expect(html).toContain('<p class="callout-header">');
  });

  it("wraps the body when configured", async () => {
    const html = await render(":::note\nPremier.\n\nSecond.\n:::", {
      markup: { ...base.markup, wrapBody: true },
    });
    expect(html).toContain('<div class="callout-body"><p>Premier.</p><p>Second.</p></div>');
  });

  describe("label modes", () => {
    const label = ":::tip[**Gras** et suite]\nx\n:::";

    it("deep-text flattens nested labels and trims", async () => {
      const html = await render(label, { labelMode: "deep-text" });
      expect(html).toContain('<span class="callout-title">Gras et suite</span>');
    });

    it("deep-text falls back to the default title on empty labels", async () => {
      const html = await render(":::tip[  ]\nx\n:::", { labelMode: "deep-text" });
      expect(html).toContain('<span class="callout-title">Astuce</span>');
    });

    it("shallow-text only reads direct child values", async () => {
      const html = await render(label, { labelMode: "shallow-text" });
      expect(html).toContain('<span class="callout-title">et suite</span>');
    });

    it("shallow-raw keeps the untrimmed value, even empty", async () => {
      const html = await render(label, { labelMode: "shallow-raw" });
      expect(html).toContain('<span class="callout-title"> et suite</span>');
      const empty = await render(":::tip[**Gras**]\nx\n:::", { labelMode: "shallow-raw" });
      expect(empty).toContain('<span class="callout-title"></span>');
    });

    it("inline keeps the label markdown as the title (wrapped header)", async () => {
      const html = await render(label, {
        labelMode: "inline",
        markup: {
          ...base.markup,
          header: {
            kind: "wrapped",
            icon,
            iconWrapClass: "callout-icon",
            titleClass: "callout-title",
            chevron,
            chevronWrapClass: "callout-chevron-wrap",
          },
        },
      });
      expect(html).toContain('<span class="callout-title"><strong>Gras</strong> et suite</span>');
    });

    it("text-nodes finds the label anywhere and removes it from the body", async () => {
      const html = await render(label, { labelMode: "text-nodes" });
      expect(html).toContain('<span class="callout-title">Gras et suite</span>');
      expect(html).not.toContain("<strong>");
      expect(html).toContain("<p>x</p>");
    });
  });

  describe("header kinds", () => {
    it("raw emits the icon as raw HTML followed by the bare title", async () => {
      const html = await render(":::note\nx\n:::", {
        labelMode: "shallow-raw",
        markup: {
          staticTag: "aside",
          rootExtras: (variant, collapsible) =>
            collapsible ? { "data-callout": variant } : { role: "note", "data-callout": variant },
          headerClass: "callout-title",
          header: { kind: "raw", icon: (variant) => `<svg data-icon="${variant}"></svg>` },
        },
      });
      expect(html).toStartWith(
        '<aside class="callout callout-note" role="note" data-callout="note">' +
          '<div class="callout-title"><svg data-icon="note"></svg>Note</div>',
      );
    });

    it("wrapped nests icon, inline title and chevron in spans", async () => {
      const html = await render(":::note[Un *titre*]\nx\n:::", {
        labelMode: "inline",
        markup: {
          staticTag: "div",
          collapsibleClass: true,
          rootExtras: (variant) => ({ "data-callout": variant }),
          headerClass: "callout-header",
          wrapBody: true,
          header: {
            kind: "wrapped",
            icon,
            iconWrapClass: "callout-icon",
            titleClass: "callout-title",
            chevron,
            chevronWrapClass: "callout-chevron-wrap",
          },
        },
      });
      expect(html).toContain('<span class="callout-icon"><svg viewBox="0 0 24 24"');
      expect(html).toContain('<span class="callout-title">Un <em>titre</em></span>');
      expect(html).not.toContain("callout-chevron-wrap");

      const collapsible = await render(":::note{collapse}\nx\n:::", {
        labelMode: "inline",
        markup: {
          staticTag: "div",
          collapsibleClass: true,
          rootExtras: (variant) => ({ "data-callout": variant }),
          headerClass: "callout-header",
          wrapBody: true,
          header: {
            kind: "wrapped",
            icon,
            iconWrapClass: "callout-icon",
            titleClass: "callout-title",
            chevron,
            chevronWrapClass: "callout-chevron-wrap",
          },
        },
      });
      expect(collapsible).toContain('<span class="callout-chevron-wrap"><svg');
    });
  });

  it("matches the historical _core markup byte for byte", async () => {
    const html = await render(":::tip[Bien joué]\nCorps.\n:::", {
      labelMode: "inline",
      markup: {
        staticTag: "div",
        collapsibleClass: true,
        rootExtras: (variant) => ({ "data-callout": variant }),
        headerClass: "callout-header",
        wrapBody: true,
        header: {
          kind: "wrapped",
          icon,
          iconWrapClass: "callout-icon",
          titleClass: "callout-title",
          chevron,
          chevronWrapClass: "callout-chevron-wrap",
        },
      },
    });
    expect(html).toMatchSnapshot();
  });
});
