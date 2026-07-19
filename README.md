<div align="center">

<img src="docs/banner.png" alt="Lisible" width="100%">

One audited core, six visual variants. Bilingual, dark by default, fast, SEO-ready, accessible. You pick the look in a config file; everything else is already done.

<p>
<img alt="Astro" src="https://img.shields.io/badge/Astro-7-BC52EE?style=flat-square&logo=astro&logoColor=white">
<img alt="React" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white">
<img alt="Bun" src="https://img.shields.io/badge/Bun-runtime-000000?style=flat-square&logo=bun&logoColor=white">
<img alt="License MIT" src="https://img.shields.io/badge/License-MIT-22C55E?style=flat-square">
</p>

<p>
<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdidntchooseaname%2Flisible&amp;root-directory=versions%2Forganique&amp;build-command=bun%20run%20build&amp;install-command=bun%20install&amp;output-directory=dist"><img alt="Deploy with Vercel" src="https://vercel.com/button" height="32"></a>
<a href="https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fdidntchooseaname%2Flisible&amp;base=versions%2Forganique"><img alt="Deploy to Netlify" src="https://www.netlify.com/img/deploy/button.svg" height="32"></a>
</p>

[Quick start](#quick-start) · [Variants](#variants) · [Configuration](#configuration) · [Features](#features) · [License](#license)

</div>

---

## Variants

Six skins over the exact same core. Same features, same content, same theme tokens: only the experience changes.

<table>
<tr>
<td width="33%" align="center">
<img src="docs/previews/motion-primitives-blog-dark.jpeg" alt="motion-primitives variant" width="100%"><br>
<b>motion-primitives</b><br>
<sub>Swiss minimalism, typographic micro-interactions</sub>
</td>
<td width="33%" align="center">
<img src="docs/previews/cult-ui-blog-dark.jpeg" alt="cult-ui variant" width="100%"><br>
<b>cult-ui</b><br>
<sub>Editorial, gradient headings, textured controls</sub>
</td>
<td width="33%" align="center">
<img src="docs/previews/aceternity-blog-dark.jpeg" alt="aceternity variant" width="100%"><br>
<b>aceternity</b><br>
<sub>Spotlight, bento grid, tracing beam</sub>
</td>
</tr>
<tr>
<td width="33%" align="center">
<img src="docs/previews/reactbits-blog-dark.jpeg" alt="reactbits variant" width="100%"><br>
<b>reactbits</b><br>
<sub>Dense animated components, pill nav</sub>
</td>
<td width="33%" align="center">
<img src="docs/previews/organique-blog-dark.jpeg" alt="organique variant" width="100%"><br>
<b>organique</b><br>
<sub>Draggable node constellation, live link states, floating dock</sub>
</td>
<td width="33%" align="center">
<img src="docs/previews/h4x0r-blog-dark.jpeg" alt="H4X0R variant" width="100%"><br>
<b>H4X0R</b><br>
<sub>Immersive terminal HUD, interactive background</sub>
</td>
</tr>
</table>

<div align="center"><sub>Each variant ships light and dark. More previews in <a href="docs/previews/"><code>docs/previews/</code></a>.</sub></div>

### The same post, six ways

Full-page captures of the demonstration post, so you can compare how each variant renders the same content end to end (prose, code blocks, callouts, diagrams, cards).

<table>
<tr>
<td width="33%" align="center">
<a href="docs/previews/motion-primitives-article-dark.jpeg"><img src="docs/previews/motion-primitives-article-dark.jpeg" alt="motion-primitives demo post" width="100%"></a><br>
<b>motion-primitives</b>
</td>
<td width="33%" align="center">
<a href="docs/previews/cult-ui-article-dark.jpeg"><img src="docs/previews/cult-ui-article-dark.jpeg" alt="cult-ui demo post" width="100%"></a><br>
<b>cult-ui</b>
</td>
<td width="33%" align="center">
<a href="docs/previews/aceternity-article-dark.jpeg"><img src="docs/previews/aceternity-article-dark.jpeg" alt="aceternity demo post" width="100%"></a><br>
<b>aceternity</b>
</td>
</tr>
<tr>
<td width="33%" align="center">
<a href="docs/previews/reactbits-article-dark.jpeg"><img src="docs/previews/reactbits-article-dark.jpeg" alt="reactbits demo post" width="100%"></a><br>
<b>reactbits</b>
</td>
<td width="33%" align="center">
<a href="docs/previews/organique-article-dark.jpeg"><img src="docs/previews/organique-article-dark.jpeg" alt="organique demo post" width="100%"></a><br>
<b>organique</b>
</td>
<td width="33%" align="center">
<a href="docs/previews/h4x0r-article-dark.jpeg"><img src="docs/previews/h4x0r-article-dark.jpeg" alt="H4X0R demo post" width="100%"></a><br>
<b>H4X0R</b>
</td>
</tr>
</table>

<div align="center"><sub>Click any image to open it full size.</sub></div>

## Quick start

Lisible uses [Bun](https://bun.sh) for its tooling, so Bun needs to be installed. It is fast and recommended. Once it is present you can drive the project with npm, pnpm or bun, whichever you prefer.

**Install Bun**

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/bun/install.ps1 | iex"

# or, if you already have Node
npm install -g bun
```

**Set up the project**

```bash
git clone https://github.com/didntchooseaname/lisible
cd lisible
```

Then run the guided setup. It walks you through the variant, site title and URL, then either stops there (quick mode) or lets you fine-tune author, accent color and repository (detailed mode). It writes the active variant to `lisible.config.json` and the global identity to `shared/site.config.ts`.

No manual install step is required. `init` installs the selected variant automatically. You can also run `preview:all` immediately on a fresh clone, before or after `init`; it installs and rebuilds all six variants before starting their preview servers.

<details open>
<summary><b>bun</b> (recommended)</summary>

```bash
bun run init          # guided setup + automatic dependency installation
bun run dev           # start the dev server
bun run build         # build the static site (the variant's dist/)
bun run preview       # serve the build locally
bun run variant       # print the active variant
bun run preview:all   # install, build and compare every variant (ports 4321-4326)
```

</details>

<details>
<summary><b>npm</b></summary>

```bash
npm run init          # guided setup + automatic dependency installation
npm run dev           # start the dev server
npm run build         # build the static site (the variant's dist/)
npm run preview       # serve the build locally
npm run variant       # print the active variant
npm run preview:all   # install, build and compare every variant (ports 4321-4326)
```

</details>

<details>
<summary><b>pnpm</b></summary>

```bash
pnpm run init         # guided setup + automatic dependency installation
pnpm run dev          # start the dev server
pnpm run build        # build the static site (the variant's dist/)
pnpm run preview      # serve the build locally
pnpm run variant      # print the active variant
pnpm run preview:all  # install, build and compare every variant (ports 4321-4326)
```

</details>

Prefer to configure by hand? Skip the wizard, set `variant` in `lisible.config.json`, and run `dev`.

## How it works

Your content lives once. Astro renders it to static HTML and hydrates only the interactive pieces (islands). The variant chosen in the config decides the skin.

```mermaid
flowchart LR
  MD["MDX by default<br/>fr + en"] --> AC["Astro content<br/>collections"]
  CFG["lisible.config.json"] --> SEL["Active variant"]
  AC --> SEL
  SEL --> HTML["Static HTML"]
  SEL --> ISL["React islands<br/>hydrated on demand"]
  HTML --> OUT["dist/<br/>static site"]
  ISL --> OUT
```

The six variants are skins over a single shared core, so a fix or a feature lands everywhere the same way.

```mermaid
flowchart TD
  CORE["Shared core<br/>i18n · theme · search · SEO · code · cards"]
  CORE --> V1["motion-primitives"]
  CORE --> V2["cult-ui"]
  CORE --> V3["aceternity"]
  CORE --> V4["reactbits"]
  CORE --> V5["organique"]
  CORE --> V6["H4X0R"]
```

## Configuration

### Choose a variant

The active variant is the single choice you make, in `lisible.config.json`:

```json
{
  "variant": "organique"
}
```

Valid values: `motion-primitives`, `cult-ui`, `aceternity`, `reactbits`, `organique`, `h4x0r`. Not sure which one? Run `bun run preview:all` and compare them in the browser.

### Site identity

`shared/site.config.ts` holds the site identity and integrations for every version. `shared/features.ts` holds the feature flags:

```ts
export const SITE = {
  title: "Lisible",
  author: "Lisible",
  url: "https://example.com",
  accent: "#22C55E",
  social: {
    github: "https://github.com/didntchooseaname/lisible",
    bluesky: "https://bsky.app/profile/alice.example.com",
    mastodon: "https://mastodon.social/@alice",
    linkedin: "https://www.linkedin.com/in/alice-example/",
    email: "mailto:hello@example.com",
  },
  repo: { url: "", branch: "main" },
};
```

The small `versions/<variant>/src/site.config.ts` file is only an adapter for the local component API. Interface strings and taglines stay beside each theme in `src/i18n/`, with French and English side by side.

Fresh clones render local discussion placeholders on every article. Replace the example profiles, configure `INTEGRATIONS`, enable `comments` and/or `webmentions`, then disable `demoPlaceholders` when connecting real providers.

## Features

Everything below is built in and shared by all six variants.

**Reading**
- Full-text search (Pagefind), <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd>
- Table of contents with scroll spy, reading time, prev/next, reading progress
- Full-screen image viewer with zoom and pan
- Callouts, KaTeX math, Mermaid and draw.io diagrams that re-render with the theme
- Rich code blocks (Expressive Code): titled editor and terminal frames, line and word markers, collapsible sections, copy button
- GitHub repository cards and OpenGraph link previews from the content

**Theme**
- Dark by default (true black), light (pure white), no flash on load
- Animated theme toggle (circular reveal), state preserved across navigation
- Reader-customizable accent color, contrast guaranteed in both modes

**International and SEO**
- Native FR/EN routing (`/` and `/en/`), translated content, hreflang, per-locale RSS
- Per-post OpenGraph images, JSON-LD, sitemap, robots.txt, `llms.txt`
- No full page reloads: view transitions with hover prefetch

**Authoring**
- `bun run new-post` scaffolding, drafts hidden in production
- Covers, pinned posts and tags; Archives in the top navbar; Series shown there only when published series content exists
- Link checking and asset budgets in the build

**Accessibility**
- Full keyboard navigation, visible focus, AA contrast, reduced motion respected

## Create a post in 30 seconds

The fastest way is the scaffolder. It creates the file in the shared content source with valid frontmatter, in the right language, ready to edit:

```bash
bun run new-post my-first-post            # French MDX post (default)
bun run new-post my-first-post --locale en # English post
bun run new-post my-first-post --translate # create both fr and en at once
bun run new-post my-first-post --markdown  # opt into plain Markdown
```

Then open the generated `.mdx` file under `shared/content/blog/`, write your content, and set `draft: false` when you are ready. MDX is the global default: it supports all regular Markdown plus the shared `Tabs`, `Steps` and `Spoiler` components. Every variant reads that same file, so it appears on the home page, the blog list, the search index and the RSS feed automatically.

Prefer to do it by hand? Create a `.mdx` file under `shared/content/blog/fr/` (or `en/`) with this frontmatter:

```yaml
---
title: "My post"
description: "In one sentence, what it is about."
pubDate: 2026-07-18
updatedDate: 2026-07-18   # optional
tags: ["astro", "performance"]
cover: "/images/cover.jpg" # optional
draft: false
---
```

A file with the same name in `fr/` and `en/` links the two translations. Drafts (`draft: true`) are visible in development and hidden in production. The `demo-fonctionnalites.mdx` post is the canonical, bilingual integration reference: it renders Markdown, rich directives, diagrams, footnotes, `Tabs`, `Steps` and `Spoiler` in every variant.

## Project structure

```text
lisible/
├─ lisible.config.json     # active variant
├─ package.json            # global commands
├─ scripts/                # runner, scaffolder, previews and checks
├─ shared/
│  ├─ site.config.ts       # identity and integrations for every version
│  ├─ features.ts          # global feature flags
│  ├─ variants.ts          # variant catalog and preview ports
│  ├─ content/
│  │  ├─ collection.ts     # single frontmatter schema
│  │  ├─ taxonomy.ts       # bilingual tag aliases
│  │  ├─ blog/fr/          # only source for French articles
│  │  ├─ blog/en/          # only source for English articles
│  │  └─ public-images/    # shared article assets
│  ├─ routes/              # identical locale, blog, tag, RSS and robots routes
│  ├─ markdown/            # shared Markdown pipeline helpers
│  └─ public/              # common favicon, KaTeX and fallback OG asset
├─ docs/previews/          # variant screenshots
└─ versions/
   ├─ _core/               # reference implementation
   ├─ motion-primitives/   # visual implementation and thin adapters
   ├─ cult-ui/
   ├─ aceternity/
   ├─ reactbits/
   ├─ organique/
   └─ h4x0r/
```

The rule is deliberate: content and behavior that must change everywhere belong in `shared/`; theme components, styles and theme-specific copy stay in `versions/<variant>/`. Shared source files are linked into the locations Astro expects, so there is still only one file to edit.

## Credits and licenses

Lisible itself is released under the MIT License, see [LICENSE](LICENSE).

It stands on the work of others. Each dependency keeps its own license; the terms below are the ones published by each project at the time of writing, always defer to the upstream license.

**UI component kits.** Components are adapted and copied into each variant per each kit's license.

| Kit | Link | License |
| --- | --- | --- |
| motion-primitives | https://motion-primitives.com | MIT |
| cult/ui | https://www.cult-ui.com | MIT |
| Aceternity UI | https://ui.aceternity.com | MIT (free components) |
| ReactBits | https://reactbits.dev | MIT |
| Magic UI | https://magicui.design | MIT |

**Core libraries.** [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), [Expressive Code](https://expressive-code.com), [Pagefind](https://pagefind.app), [Motion](https://motion.dev), [GSAP](https://gsap.com), [Lucide](https://lucide.dev), [KaTeX](https://katex.org) and [Mermaid](https://mermaid.js.org), each under its own license (MIT for most, OFL or Apache for some). Package manager: [Bun](https://bun.sh).

**Fonts.** Inter, JetBrains Mono and Orbitron, served through [Fontsource](https://fontsource.org), all under the SIL Open Font License.

Trademarks and brand names belong to their respective owners; linking to them here is attribution, not endorsement.
