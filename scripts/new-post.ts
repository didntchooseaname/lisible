import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SHARED_FEATURES } from "../shared/features";

type Locale = "fr" | "en";

interface Args {
  slug: string;
  locale: Locale;
  title?: string;
  titleEn?: string;
  tags: string[];
  series?: string;
  cover?: string;
  featured: boolean;
  translate: boolean;
  mdx: boolean;
}

const CONTENT_DIR = join(import.meta.dirname, "../shared/content/blog");

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (!SHARED_FEATURES.newPostCli) {
  fail("the new-post scaffolder is disabled (features.newPostCli in lisible.config.json).");
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let locale: Locale = "fr";
  let title: string | undefined;
  let titleEn: string | undefined;
  let tags: string[] = [];
  let series: string | undefined;
  let cover: string | undefined;
  let featured = false;
  let translate = false;
  let mdx = true;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--locale") {
      const value = argv[++index];
      if (value !== "fr" && value !== "en") {
        fail(`--locale must be "fr" or "en" (received: ${value ?? "empty"}).`);
      }
      locale = value;
    } else if (arg === "--title") {
      title = argv[++index];
      if (!title) fail("--title expects a value.");
    } else if (arg === "--title-en") {
      titleEn = argv[++index];
      if (!titleEn) fail("--title-en expects a value.");
    } else if (arg === "--tags") {
      const value = argv[++index];
      if (!value) fail('--tags expects a comma separated list, like "astro,performance".');
      tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (arg === "--series") {
      series = argv[++index];
      if (!series) fail("--series expects a value.");
    } else if (arg === "--cover") {
      cover = argv[++index];
      if (!cover) fail("--cover expects an image path.");
    } else if (arg === "--featured") {
      featured = true;
    } else if (arg === "--translate") {
      translate = true;
    } else if (arg === "--mdx") {
      mdx = true;
    } else if (arg === "--markdown") {
      mdx = false;
    } else if (arg.startsWith("--")) {
      fail(`unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) {
    fail(
      'usage: bun run new-post <slug> [--locale fr|en] [--title "Title"] [--title-en "Title"] ' +
        '[--tags "a,b"] [--series "Name"] [--cover /images/x.jpg] [--featured] ' +
        "[--translate] [--markdown]",
    );
  }

  const slug = slugify(positional[0]);
  if (!slug) fail(`invalid slug: ${positional[0]}`);
  return { slug, locale, title, titleEn, tags, series, cover, featured, translate, mdx };
}

function titleFromSlug(slug: string): string {
  const words = slug.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function today(): string {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function template(locale: Locale, title: string, args: Args): string {
  const safeTitle = title.replaceAll('"', '\\"');
  const description =
    locale === "fr"
      ? "Description courte de l’article, en 160 caractères maximum."
      : "Short description of the post, up to 160 characters.";
  const body = locale === "fr" ? "Écrivez votre article ici." : "Write your post here.";
  const quoted = args.tags.map((tag) => `"${tag.replaceAll('"', '\\"')}"`).join(", ");

  const lines = [
    "---",
    `title: "${safeTitle}"`,
    `description: "${description}"`,
    `pubDate: ${today()}`,
    `tags: [${quoted}]`,
    "draft: true",
  ];
  if (args.cover) {
    lines.push(`cover: "${args.cover}"`, 'coverAlt: "Describe the cover image"');
  }
  if (args.featured) lines.push("featured: true");
  if (args.series) {
    lines.push(`series: "${args.series.replaceAll('"', '\\"')}"`, "seriesOrder: 1");
  }
  // The remaining schema fields, ready to uncomment.
  lines.push("# updatedDate: " + today());
  if (!args.cover) {
    lines.push('# cover: "/images/cover.jpg"', '# coverAlt: "Describe the cover image"');
  }
  if (!args.featured) lines.push("# featured: true");
  if (!args.series) lines.push('# series: "Series name"', "# seriesOrder: 1");
  lines.push("---", "", body, "");
  return lines.join("\n");
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function createPost(
  slug: string,
  locale: Locale,
  title: string,
  extension: string,
  args: Args,
): Promise<void> {
  const path = join(CONTENT_DIR, locale, `${slug}.${extension}`);
  if (await exists(path)) fail(`file already exists: ${path}.`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, template(locale, title, args), "utf8");
  console.log(`Created: shared/content/blog/${locale}/${slug}.${extension}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const title = args.title ?? titleFromSlug(args.slug);
  const extension = args.mdx ? "mdx" : "md";
  const localizedTitle = (target: Locale): string =>
    target === "en" && args.titleEn ? args.titleEn : title;
  await createPost(args.slug, args.locale, localizedTitle(args.locale), extension, args);
  if (args.translate) {
    const otherLocale: Locale = args.locale === "fr" ? "en" : "fr";
    await createPost(args.slug, otherLocale, localizedTitle(otherLocale), extension, args);
  }
  console.log("The draft is visible in development and excluded from production.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
