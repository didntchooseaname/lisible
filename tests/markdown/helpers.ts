import type { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { Plugin } from "unified";
import { unified } from "unified";

/**
 * Minimal markdown pipeline mirroring what the variants run inside Astro:
 * parse, directives, the plugin under test, mdast to hast, serialize. Raw
 * HTML is allowed because motion-primitives emits its callout icon as a raw
 * string. The serialized HTML is the contract the drift net protects, so the
 * tests assert on it directly.
 */
export async function mdToHtml(
  md: string,
  plugins: Array<Plugin<[], Root>>,
  path?: string,
): Promise<string> {
  let processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);
  for (const plugin of plugins) processor = processor.use(plugin);
  const file = await processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(path === undefined ? md : { path, value: md });
  return String(file);
}

/**
 * Same pipeline with the plugins under test on the hast side, after mdast to
 * hast conversion, where the heading anchor plugins run in the variants.
 */
export async function mdToHtmlRehype(
  md: string,
  plugins: Array<Plugin<[], import("hast").Root>>,
  path?: string,
): Promise<string> {
  let processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkRehype, { allowDangerousHtml: true });
  for (const plugin of plugins) processor = processor.use(plugin);
  const file = await processor
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(path === undefined ? md : { path, value: md });
  return String(file);
}

/** Locale resolver used by every adapter: the en/ content folder wins. */
export const localeFromPath = (file: { path?: string } | undefined): "fr" | "en" =>
  file?.path?.includes("/en/") ? "en" : "fr";
