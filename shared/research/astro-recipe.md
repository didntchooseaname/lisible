PACKAGE VERSIONS (verified via registry.npmjs.org/<pkg>/latest, 2026-07-17)
- astro: 7.1.0
- @astrojs/react: 6.0.1 (peerDeps: react/react-dom ^17.0.2 || ^18.0.0 || ^19.0.0)
- react: 19.2.7
- react-dom: 19.2.7
- tailwindcss: 4.3.3
- @tailwindcss/vite: 4.3.3
- @astrojs/mdx: 7.0.3
- @astrojs/sitemap: 3.7.3
- @astrojs/rss: 4.0.19
- motion: 12.42.2 (successor package; import from "motion/react")
- framer-motion: 12.42.2 (legacy name; prefer "motion")
NOTE: npm latest astro is 7.x, not 5.x. If Astro 5 is explicitly required, pin astro@^5 (bun add astro@5) — but all docs below are current stable docs and apply to 5.x+ (content collections API shown is the Astro 5 model). Everything below is version-agnostic across 5–7 unless noted.

1) NON-INTERACTIVE SCAFFOLD WITH BUN
create-astro flags (verified from create-astro README): --template <name>, --install/--no-install, --git/--no-git, --yes/-y, --no/-n, --skip-houston, --dry-run, --add <integrations>, --help. There is no --typescript flag anymore (strict tsconfig is the default). "minimal" is the empty template; "basics" is the default starter; "blog" also exists.
Bun forwards flags directly (no "--" separator needed, unlike npm):
  bun create astro@latest my-blog --template minimal --no-git --no-install --skip-houston -y
Then:
  cd my-blog && bun install
(To pin Astro 5: afterwards run bun add astro@^5.)
Optional one-shot integrations: --add react (e.g. bun create astro@latest my-blog --template minimal --add react --no-git -y).
Dev/build: bun run dev / bun run build / bun run preview. Optionally bun add -d @types/bun. Astro docs warn: "Using Bun with Astro may reveal rough edges."

2) ADD @astrojs/react + TAILWIND v4
Automatic: bunx astro add react  and  bunx astro add tailwind (astro add tailwind sets up v4 automatically on Astro >= 5.2.0).
Manual:
  bun add @astrojs/react react react-dom
  bun add -d @types/react @types/react-dom tailwindcss @tailwindcss/vite
astro.config.mjs (exact, per Astro + Tailwind official guides):
  import { defineConfig } from "astro/config";
  import react from "@astrojs/react";
  import tailwindcss from "@tailwindcss/vite";
  export default defineConfig({
    integrations: [react()],
    vite: { plugins: [tailwindcss()] },
  });
(Tailwind v4 is a Vite plugin, NOT an Astro integration; there is no tailwind.config.js by default — theme goes in CSS via @theme.)
tsconfig.json additions for React: "jsx": "react-jsx", "jsxImportSource": "react".
src/styles/global.css:
  @import "tailwindcss";
Import it once in the base layout frontmatter: import "../styles/global.css";
package.json deps to add for the full blog: @astrojs/mdx, @astrojs/sitemap (both go in integrations: [mdx(), sitemap()]; sitemap needs site: "https://..." in defineConfig), @astrojs/rss (used in src/pages/rss.xml.js, not an integration), motion.

3) CONTENT COLLECTIONS (Astro 5 model)
Config file: src/content.config.ts (project root src/, NOT src/content/config.ts which was the v4 location).
  import { defineCollection, z } from 'astro:content';
  import { glob } from 'astro/loaders';
  const blog = defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
    }),
  });
  export const collections = { blog };
Query: const posts = await getCollection('blog'); single: await getEntry('blog', 'my-post').
Render (Astro 5: render is a function imported from astro:content, not entry.render()):
  import { render } from 'astro:content';
  const { Content, headings } = await render(entry);
IDs: glob() generates URL-friendly ids from filenames (entry.id replaces v4 slug; a frontmatter slug property can override; generateId() option customizes). Dynamic routes use getStaticPaths mapping params: { id: post.id }.

4) DARK MODE (class-based, Tailwind v4)
In global.css, after the import (verbatim from Tailwind docs):
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
(data-attribute alternative: @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));)
No-flash inline script in <head> of the base layout — must be is:inline so Astro doesn't bundle/defer it:
  <script is:inline>
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  </script>
Toggle logic: localStorage.theme = "light" | "dark"; localStorage.removeItem("theme") to follow OS.
Keeping React islands theme-aware:
- Tailwind-styled islands need nothing: dark: variants react to the .dark class on <html> via pure CSS.
- For JS-level awareness (icons, charts, motion values): on mount read document.documentElement.classList.contains('dark'), then subscribe via a MutationObserver on documentElement's class attribute (or dispatch a CustomEvent like "theme-change" from the toggle and listen in the island). Also listen to window matchMedia('(prefers-color-scheme: dark)') change for the "system" case.
- If using Astro view transitions/ClientRouter, re-run the theme script on astro:after-swap since <html> attributes reset.

5) SHADCN-STYLE REACT COMPONENTS IN ASTRO
Prereqs: React integration + Tailwind v4 (above) + path aliases in tsconfig.json: "baseUrl": ".", "paths": { "@/*": ["./src/*"] }.
Init: bunx shadcn@latest init  — then  bunx shadcn@latest add button ...
Import in .astro files: import { Button } from "@/components/ui/button".
Client directives:
- No directive at all: component renders as static HTML with zero JS — correct for purely presentational shadcn pieces (Card, Badge, static Button).
- client:load — high priority; interactive elements visible immediately above the fold (theme toggle, nav menu, command palette trigger).
- client:idle — medium priority; hydrates after initial page load when the browser is idle (requestIdleCallback); good for interactive-but-not-urgent widgets; since Astro 4.15 accepts a timeout: client:idle={{ timeout: 500 }}.
- client:visible — low priority; hydrates via IntersectionObserver when entering the viewport; best for below-the-fold/expensive islands (comment widgets, animated sections); supports client:visible={{ rootMargin: "200px" }} to pre-hydrate before it scrolls in.
- client:media="(max-width: 768px)" — hydrates only when the media query matches (mobile-only sidebar).
- client:only="react" — skips SSR entirely; needed for components that break on the server (e.g. ones touching window at render, some motion/animation components).
Radix-based interactive shadcn components (Dialog, DropdownMenu, etc.) must be hydrated (usually client:load or client:idle) and portals/state must live inside one island — separate islands don't share React context.

6) SHIKI CODE HIGHLIGHTING (built into Astro)
Shiki is the default highlighter (default theme github-dark), zero JS, inline styles. Configure in astro.config.mjs:
  export default defineConfig({
    markdown: {
      shikiConfig: {
        themes: { light: 'github-light', dark: 'github-dark' },
        // defaultColor: false,  // optional: emit only CSS variables, no default color
        wrap: true,
        // langs: [], transformers: []
      },
    },
  });
Dual-theme output writes --shiki-dark* CSS variables; you must add CSS to activate the dark palette. For the class-based dark mode from section 4, use (Astro uses .astro-code, not .shiki):
  .dark .astro-code,
  .dark .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }
(The docs' example uses @media (prefers-color-scheme: dark) — swap that wrapper for the .dark selector to sync with the class toggle.) Applies to .md, .mdx, and the <Code /> component from astro:components.

SOURCE NOTES
- Astro styling-guide summary I received rendered the vite plugin line garbled; the config in section 2 is the verbatim form from Tailwind's official Astro framework guide (tailwindcss.com/docs/installation/framework-guides/astro) and matches astro add tailwind output.
- Shiki details came from docs.astro.build/en/guides/syntax-highlighting/ (the markdown-content page no longer hosts shikiConfig docs).
- Client directive semantics from docs.astro.build/en/reference/directives-reference/; shadcn steps from ui.shadcn.com/docs/installation/astro; bun commands from docs.astro.build/en/recipes/bun/.
