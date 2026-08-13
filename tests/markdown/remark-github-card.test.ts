import { describe, expect, it } from "bun:test";
import {
  buildClassicGithubCard,
  buildCultGithubCard,
  buildKitGithubCard,
  buildMonoGithubCard,
  createRemarkGithubCard,
} from "../../shared/markdown/remark-github-card";
import { mdToHtml } from "./helpers";

const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

const classicLabels = {
  stars: "Étoiles",
  forks: "Forks",
  language: "Langage",
  loading: "Chargement du dépôt",
  viewOnGithub: "Voir sur GitHub",
};

const classic = createRemarkGithubCard({
  directiveTypes: "leaf",
  isValidRepo: (repo) => typeof repo === "string" && REPO_PATTERN.test(repo),
  wrapProperties: { class: "github-card-wrap" },
  invalidProperties: { class: "github-card-invalid" },
  locale: () => "fr" as const,
  card: (repo) => buildClassicGithubCard(repo, classicLabels),
});

describe("createRemarkGithubCard", () => {
  it("replaces a valid leaf directive with the wrapped card", async () => {
    const html = await mdToHtml('::github{repo="withastro/astro"}', [classic]);
    expect(html).toStartWith('<div class="github-card-wrap"><a class="github-card is-loading"');
    expect(html).toContain('href="https://github.com/withastro/astro"');
    expect(html).toContain('data-github-repo="withastro/astro"');
    expect(html).toContain('<span class="gc-owner">withastro</span>');
    expect(html).toContain('<span class="gc-repo">astro</span>');
  });

  it("renders the invalid placeholder for a malformed repo", async () => {
    const html = await mdToHtml('::github{repo="pas-un-repo"}', [classic]);
    expect(html).toBe('<div class="github-card-invalid"></div>');
  });

  it("renders the invalid placeholder when the repo attribute is missing", async () => {
    const html = await mdToHtml("::github", [classic]);
    expect(html).toBe('<div class="github-card-invalid"></div>');
  });

  it("leaf mode ignores container and text directives", async () => {
    const container = await mdToHtml(':::github{repo="a/b"}\nx\n:::', [classic]);
    expect(container).not.toContain("github-card");
    const text = await mdToHtml('avant :github{repo="a/b"} après', [classic]);
    expect(text).not.toContain("github-card");
  });

  it("all mode matches the three directive kinds", async () => {
    const all = createRemarkGithubCard({
      directiveTypes: "all",
      isValidRepo: (repo) => typeof repo === "string" && REPO_PATTERN.test(repo),
      wrapProperties: { class: "wrap" },
      invalidProperties: { class: "invalid" },
      locale: () => undefined,
      card: (repo) => buildCultGithubCard(repo),
    });
    const container = await mdToHtml(':::github{repo="a/b"}\nx\n:::', [all]);
    expect(container).toStartWith('<div class="wrap"><a class="gh-card"');
    const text = await mdToHtml('avant :github{repo="a/b"} après', [all]);
    expect(text).toContain('<div class="wrap"><a class="gh-card"');
  });

  it("lets the variant predicate decide validity per directive type", async () => {
    const picky = createRemarkGithubCard({
      directiveTypes: "all",
      isValidRepo: (repo, type) => type === "leafDirective" && typeof repo === "string",
      wrapProperties: { class: "wrap" },
      invalidProperties: { class: "invalid" },
      locale: () => undefined,
      card: (repo) => buildCultGithubCard(repo),
    });
    expect(await mdToHtml('::github{repo="a/b"}', [picky])).toStartWith('<div class="wrap">');
    expect(await mdToHtml(':::github{repo="a/b"}\nx\n:::', [picky])).toBe(
      '<div class="invalid"></div>',
    );
  });
});

describe("card families", () => {
  it("classic family (used by _core, h4x0r, organique)", async () => {
    const html = await mdToHtml('::github{repo="withastro/astro"}', [classic]);
    expect(html).toContain('<span class="gc-sr">Étoiles: </span>');
    expect(html).toContain('<span data-gc-stars=""></span>');
    expect(html).toContain('title="Voir sur GitHub"');
    expect(html).toContain(
      '<span class="gc-description" data-gc-description="">Chargement du dépôt</span>',
    );
    expect(html).toMatchSnapshot();
  });

  it("kit family with every option on (aceternity)", async () => {
    const plugin = createRemarkGithubCard({
      directiveTypes: "leaf",
      isValidRepo: (repo) => typeof repo === "string" && repo.includes("/"),
      wrapProperties: { class: "card-github-wrap" },
      invalidProperties: { class: "card-github-invalid" },
      locale: () => "fr" as const,
      card: (repo) =>
        buildKitGithubCard(repo, {
          ariaLabel: `Dépôt GitHub ${repo}`,
          loadingText: "Chargement",
          statValueClass: "gc-value",
          srClass: "sr-only",
          srStars: "étoiles",
          srForks: "forks",
          detailedLanguage: true,
        }),
    });
    const html = await mdToHtml('::github{repo="a/b"}', [plugin]);
    expect(html).toContain('aria-label="Dépôt GitHub a/b"');
    expect(html).toContain('class="card-github fetch-waiting"');
    expect(html).toContain('<span class="gc-description">Chargement</span>');
    expect(html).toContain('<span class="gc-language-dot" aria-hidden="true"></span>');
    expect(html).toMatchSnapshot();
  });

  it("kit family with every option off (reactbits)", async () => {
    const plugin = createRemarkGithubCard({
      directiveTypes: "leaf",
      isValidRepo: (repo) => typeof repo === "string" && repo.includes("/"),
      wrapProperties: { class: "card-github-wrap" },
      invalidProperties: { class: "card-github-invalid" },
      locale: () => "fr" as const,
      card: (repo) =>
        buildKitGithubCard(repo, {
          statValueClass: "gc-value",
          srClass: "sr-only",
          detailedLanguage: false,
        }),
    });
    const html = await mdToHtml('::github{repo="a/b"}', [plugin]);
    expect(html).not.toContain("aria-label");
    expect(html).toContain('<span class="gc-description"></span>');
    expect(html).toContain('<span class="gc-language"></span>');
    expect(html).toMatchSnapshot();
  });

  it("cult family", async () => {
    const plugin = createRemarkGithubCard({
      directiveTypes: "leaf",
      isValidRepo: (repo) => typeof repo === "string" && repo.includes("/"),
      wrapProperties: { class: "gh-card-wrap" },
      invalidProperties: { class: "gh-card-invalid" },
      locale: () => undefined,
      card: (repo) => buildCultGithubCard(repo),
    });
    const html = await mdToHtml('::github{repo="a/b"}', [plugin]);
    expect(html).toContain('data-gh-repo="a/b"');
    expect(html).toContain('<span class="gh-card-stat" data-gh-stat="stars">');
    expect(html).toMatchSnapshot();
  });

  it("mono family (motion-primitives)", async () => {
    const plugin = createRemarkGithubCard({
      directiveTypes: "leaf",
      isValidRepo: (repo) => typeof repo === "string" && repo.includes("/"),
      wrapProperties: { class: "gh-wrap" },
      invalidProperties: { class: "gh-invalid" },
      locale: () => "fr" as const,
      card: (repo) =>
        buildMonoGithubCard(repo, {
          stars: "étoiles",
          forks: "forks",
          language: "Langage",
          repoCard: (name) => `Carte du dépôt ${name}`,
        }),
    });
    const html = await mdToHtml('::github{repo="a/b"}', [plugin]);
    expect(html).toContain('aria-label="Carte du dépôt a/b"');
    expect(html).toContain('<span class="gh-count" data-github-stars=""></span>');
    expect(html).toContain('<span class="gh-sr">Langage: </span>');
    expect(html).toMatchSnapshot();
  });
});
