import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

type Locale = "fr" | "en";

interface Args {
  slug: string;
  locale: Locale;
  title?: string;
  translate: boolean;
  mdx: boolean;
}

const CONTENT_DIR = join(import.meta.dirname, "../shared/content/blog");

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
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
    fail('usage: bun run new-post <slug> [--locale fr|en] [--title "Title"] [--translate] [--markdown]');
  }

  const slug = slugify(positional[0]);
  if (!slug) fail(`invalid slug: ${positional[0]}`);
  return { slug, locale, title, translate, mdx };
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

function template(locale: Locale, title: string): string {
  const safeTitle = title.replaceAll('"', '\\"');
  const description = locale === "fr"
    ? "Description courte de l’article, en 160 caractères maximum."
    : "Short description of the post, up to 160 characters.";
  const body = locale === "fr"
    ? "Écrivez votre article ici."
    : "Write your post here.";
  return `---
title: "${safeTitle}"
description: "${description}"
pubDate: ${today()}
tags: []
draft: true
---

${body}
`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function createPost(slug: string, locale: Locale, title: string, extension: string): Promise<void> {
  const path = join(CONTENT_DIR, locale, `${slug}.${extension}`);
  if (await exists(path)) fail(`file already exists: ${path}.`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, template(locale, title), "utf8");
  console.log(`Created: shared/content/blog/${locale}/${slug}.${extension}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const title = args.title ?? titleFromSlug(args.slug);
  const extension = args.mdx ? "mdx" : "md";
  await createPost(args.slug, args.locale, title, extension);
  if (args.translate) {
    const otherLocale: Locale = args.locale === "fr" ? "en" : "fr";
    await createPost(args.slug, otherLocale, title, extension);
  }
  console.log("The draft is visible in development and excluded from production.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
