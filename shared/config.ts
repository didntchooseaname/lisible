import { readFileSync } from "node:fs";

/**
 * Single source of user configuration: lisible.config.json at the repository
 * root. Everything in it is optional except `variant`; whatever is absent
 * falls back to the defaults below, so a fresh checkout builds unchanged.
 *
 * This module is only ever imported by build-time code (Astro configs, routes,
 * components rendered at build, scripts). It must never be pulled into a
 * client bundle: it reads the filesystem.
 */

export const PUBLIC_VARIANT_IDS = [
  "motion-primitives",
  "cult-ui",
  "aceternity",
  "reactbits",
  "organique",
  "h4x0r",
] as const;

const FEATURE_FLAG_SPEC = {
  callouts: "boolean",
  mdxComponents: "boolean",
  imageZoom: "boolean",
  headingAnchors: "boolean",
  relatedPosts: "boolean",
  math: "boolean",
  mermaid: "boolean",
  drawio: "boolean",
  ogPerPost: "boolean",
  llmsTxt: "boolean",
  aiButtons: "boolean",
  socialShare: "boolean",
  styledRss: "boolean",
  webmentions: "boolean",
  comments: "boolean",
  demoPlaceholders: "boolean",
  newPostCli: "boolean",
  linkCheck: "boolean",
  covers: "boolean",
  pinned: "boolean",
  pagination: { enabled: "boolean", pageSize: "number" },
  archives: "boolean",
  series: "boolean",
  commandPalette: "boolean",
} as const;

/** Allowed shape of lisible.config.json, mirrored by docs/lisible.config.schema.json. */
const SPEC = {
  $schema: "string",
  variant: [...PUBLIC_VARIANT_IDS] as readonly string[],
  site: {
    title: "string",
    url: "string",
    author: "string",
    accent: "string",
    postsPerPage: "number",
    featuredCount: "number",
    coverPosition: ["up", "down"] as readonly string[],
  },
  social: {
    github: "string",
    bluesky: "string",
    mastodon: "string",
    linkedin: "string",
    email: "string",
  },
  features: FEATURE_FLAG_SPEC,
  integrations: {
    webmentions: { domain: "string" },
    comments: {
      provider: ["giscus", "bluesky"] as readonly string[],
      giscus: {
        repo: "string",
        repoId: "string",
        category: "string",
        categoryId: "string",
        mapping: ["pathname", "url", "title", "og:title"] as readonly string[],
      },
      bluesky: { postUri: "string" },
    },
  },
  repo: { url: "string", branch: "string" },
} as const;

type SpecNode = string | readonly string[] | { [key: string]: SpecNode };

function validate(value: unknown, spec: SpecNode, path: string, errors: string[]): void {
  if (typeof spec === "string") {
    if (typeof value !== spec) {
      errors.push(`${path}: expected a ${spec}, got ${JSON.stringify(value)}`);
    }
    return;
  }
  if (Array.isArray(spec)) {
    if (typeof value !== "string" || !spec.includes(value)) {
      errors.push(`${path}: expected one of ${spec.join(", ")}, got ${JSON.stringify(value)}`);
    }
    return;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const childSpec = (spec as Record<string, SpecNode>)[key];
    if (childSpec === undefined) {
      const known = Object.keys(spec).join(", ");
      errors.push(`${path}${path ? "." : ""}${key}: unknown field (known fields: ${known})`);
      continue;
    }
    validate(child, childSpec, `${path}${path ? "." : ""}${key}`, errors);
  }
}

function readUserConfig(): Record<string, unknown> {
  const url = new URL("../lisible.config.json", import.meta.url);
  let raw: string;
  try {
    raw = readFileSync(url, "utf8");
  } catch {
    return {};
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `[Lisible] lisible.config.json is not valid JSON: ${(error as Error).message}`,
    );
  }
  const errors: string[] = [];
  validate(parsed, SPEC, "", errors);
  const accent = (parsed as { site?: { accent?: unknown } }).site?.accent;
  if (typeof accent === "string" && !/^#[0-9a-fA-F]{6}$/.test(accent)) {
    errors.push(`site.accent: expected a hex color like #22C55E, got ${JSON.stringify(accent)}`);
  }
  if (errors.length > 0) {
    throw new Error(
      "\n[Lisible] Invalid lisible.config.json:\n\n" +
        errors.map((message) => `  - ${message}`).join("\n") +
        "\n\nSee docs/lisible.config.schema.json for the accepted fields.\n",
    );
  }
  return parsed as Record<string, unknown>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge<T>(defaults: T, user: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(user)) {
    return (user === undefined ? defaults : user) as T;
  }
  const out: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(user)) {
    if (key === "$schema") continue;
    out[key] = merge((defaults as Record<string, unknown>)[key], value);
  }
  return out as T;
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "author"
  );
}

const user = readUserConfig();

const authorOverride =
  isPlainObject(user.site) && typeof user.site.author === "string" && user.site.author.trim()
    ? user.site.author.trim()
    : undefined;

/**
 * The demo persona every variant shows in its hero, and the author the
 * metadata credits. Setting site.author in lisible.config.json replaces the
 * persona name and derives its handle and slug; the descriptive texts stay in
 * place until edited here.
 */
const profileName = authorOverride ?? "Alex Morgan";
const profileSlug = slugify(profileName);
const profileHandle = profileSlug.split("-")[0] ?? profileSlug;

export const PROFILE = {
  name: profileName,
  handle: profileHandle,
  slug: profileSlug,
  pronouns: { fr: "iel", en: "they/them" },
  role: {
    fr: "Designer développeur et auteur technique",
    en: "Designer, developer and technical writer",
  },
  intro: {
    fr:
      "Je conçois des interfaces de lecture et j'écris sur ce qui les rend rapides: "
      + "architecture en îlots, budget de performance, typographie et accessibilité. "
      + "Ce profil est un gabarit: remplacez-le via lisible.config.json (site.author).",
    en:
      "I design reading interfaces and write about what makes them fast: islands "
      + "architecture, performance budgets, typography and accessibility. "
      + "This profile is a template: replace it through lisible.config.json (site.author).",
  },
} as const;

const DEFAULTS = {
  variant: "organique",
  site: {
    title: "Lisible",
    url: "https://blog.example.com",
    author: profileName,
    accent: "#22C55E",
    postsPerPage: 6,
    featuredCount: 2,
    coverPosition: "down" as "up" | "down",
  },
  social: {
    github: "https://github.com/didntchooseaname/lisible",
    bluesky: `https://bsky.app/profile/${profileHandle}.example.com`,
    mastodon: `https://mastodon.social/@${profileHandle}`,
    linkedin: `https://www.linkedin.com/in/${profileSlug}/`,
    email: "mailto:hello@example.com",
  },
  features: {
    callouts: true,
    mdxComponents: true,
    imageZoom: true,
    headingAnchors: true,
    relatedPosts: true,
    math: true,
    mermaid: true,
    drawio: true,
    ogPerPost: true,
    llmsTxt: true,
    aiButtons: true,
    socialShare: true,
    styledRss: true,
    webmentions: false,
    comments: false,
    demoPlaceholders: true,
    newPostCli: true,
    linkCheck: true,
    covers: true,
    pinned: true,
    pagination: { enabled: true, pageSize: 6 },
    archives: true,
    series: true,
    commandPalette: true,
  },
  integrations: {
    webmentions: { domain: "" },
    comments: {
      provider: "giscus" as "giscus" | "bluesky",
      giscus: {
        repo: "" as `${string}/${string}` | "",
        repoId: "",
        category: "",
        categoryId: "",
        mapping: "pathname" as "pathname" | "url" | "title" | "og:title",
      },
      bluesky: { postUri: "" },
    },
  },
  repo: { url: "", branch: "main" },
};

export const CONFIG = merge(DEFAULTS, user);
