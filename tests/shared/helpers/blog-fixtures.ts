/**
 * Shared fixtures and the astro:content mock used by the posts, llms and rss
 * suites. bun cannot resolve the virtual astro:content module, so each suite
 * calls registerAstroContentMock() before loading the module under test with
 * a dynamic import: the mock must be registered first.
 *
 * Note on drafts: import.meta.env.PROD is undefined under bun test, so
 * getPublishedPosts keeps draft posts (the dev behaviour). The suites assert
 * that behaviour on purpose and never test the production draft filter.
 */
import { mock } from "bun:test";

export interface FixtureData {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  draft: boolean;
  featured: boolean;
  series?: string;
  seriesOrder?: number;
}

export interface FixturePost {
  id: string;
  collection: "blog";
  body: string;
  data: FixtureData;
}

function post(
  id: string,
  body: string,
  data: Partial<FixtureData> & Pick<FixtureData, "title" | "description" | "pubDate">,
): FixturePost {
  return {
    id,
    collection: "blog",
    body,
    data: { tags: [], draft: false, featured: false, ...data },
  };
}

/**
 * Five French posts and two English ones. French ids usually have no locale
 * prefix ("post-a.mdx"), one carries an explicit "fr/" prefix to cover the
 * prefix stripping in postSlug. English ids always start with "en/".
 * Translations pair by identical filename once the prefix is stripped.
 */
export const FIXTURE_POSTS: FixturePost[] = [
  post("post-a.mdx", "Contenu du premier article, avec un peu de texte pour le corpus.", {
    title: "Premier article",
    description: "Les bases du framework.",
    pubDate: new Date("2026-03-10T12:00:00Z"),
    tags: ["Astro", "Performance"],
    featured: true,
  }),
  post("post-b.mdx", "Comment rendre un blog accessible au clavier et au lecteur d'ecran.", {
    title: "Accessibilité pratique",
    description: "Rendre un blog accessible.",
    pubDate: new Date("2026-05-02T12:00:00Z"),
    updatedDate: new Date("2026-05-10T12:00:00Z"),
    tags: ["Accessibilité"],
    series: "Architecture web moderne",
    seriesOrder: 2,
  }),
  post("post-c.mdx", "Le socle d'architecture qui ouvre la serie.", {
    title: "Architecture de base",
    description: "Le socle de la série.",
    pubDate: new Date("2026-01-15T12:00:00Z"),
    tags: ["Astro"],
    series: "Architecture web moderne",
    seriesOrder: 1,
  }),
  post("post-e.mdx", "Conclusion de la serie, sans seriesOrder explicite.", {
    title: "Épilogue de série",
    description: "Conclusion de la série.",
    pubDate: new Date("2026-04-01T12:00:00Z"),
    tags: ["Performance"],
    series: "Architecture web moderne",
  }),
  post("fr/post-d.mdx", "Brouillon encore en cours de redaction.", {
    title: "Brouillon en cours",
    description: "Un brouillon visible en dev.",
    pubDate: new Date("2026-06-20T12:00:00Z"),
    draft: true,
  }),
  post("en/post-a.mdx", "Body of the first English post.", {
    title: "First post",
    description: "Framework basics.",
    pubDate: new Date("2026-03-11T12:00:00Z"),
    tags: ["Astro", "Accessibility"],
  }),
  post("en/post-z.mdx", "Notes about web performance budgets.", {
    title: "Web performance notes",
    description: "Performance budgets in practice.",
    pubDate: new Date("2026-02-01T12:00:00Z"),
    updatedDate: new Date("2026-02-05T12:00:00Z"),
    tags: ["Performance"],
  }),
];

export function fixtureById(id: string): FixturePost {
  const found = FIXTURE_POSTS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing fixture: ${id}`);
  return found;
}

export function registerAstroContentMock(): void {
  mock.module("astro:content", () => ({
    getCollection: async (
      collection: string,
      filter?: (entry: FixturePost) => boolean,
    ): Promise<FixturePost[]> => {
      if (collection !== "blog") return [];
      // Fresh array on every call: getPublishedPosts sorts its result in place.
      const entries = [...FIXTURE_POSTS];
      return filter ? entries.filter(filter) : entries;
    },
  }));
}
