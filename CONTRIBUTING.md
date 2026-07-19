# Contributing to Lisible

Thanks for helping improve Lisible. Contributions may target the shared framework, a visual variant, the bilingual demo content, accessibility, tests, or documentation.

## Use GitHub's editor

For a small documentation or content correction:

1. Open the source file on GitHub and choose **Edit this file**.
2. Make the change and preview the diff.
3. Select **Propose changes**. If you cannot write to the repository, GitHub creates a fork and branch for you.
4. Open the pull request, explain the problem and the result, and link any relevant issue.

Never include generated `dist/`, `node_modules/`, `.astro/`, `.output/`, caches, secrets, or local environment files. They are intentionally ignored.

## Develop locally

Requirements: Git and [Bun](https://bun.sh).

```bash
git clone https://github.com/didntchooseaname/lisible.git
cd lisible
bun run init
bun run dev
```

Create a focused branch from `main`, keep unrelated changes out of the pull request, and do not rewrite files outside the feature you are changing.

## Ownership rules

- `shared/content/blog/<locale>/` owns articles. MDX is the default format.
- `shared/site.config.ts` owns the public identity and integration placeholders.
- `shared/features.ts` owns feature flags.
- `shared/routes/`, `shared/markdown/`, and shared components own behavior common to every variant.
- `versions/<variant>/src/` owns visual presentation and variant-specific interactions.
- `scripts/` owns setup, generation, orchestration, and validation.

Use `@/*` for the active variant's `src/*` and `@shared/*` for shared code in ordinary Astro source. Modules loaded by Astro configuration use the Node package-import aliases `#src/*` and `#shared/*`, so imports stay stable before TypeScript aliases are available.

## Content and i18n

Every published article must have complete French and English versions at matching relative paths. Keep frontmatter, feature coverage, code samples, internal links, footnotes, diagrams, and interactive MDX examples in parity. Translate prose and UI copy; do not ship an unreviewed machine duplicate.

Create a pair with:

```bash
bun run new-post my-article --translate
```

The demonstration article is the canonical feature showcase. If a supported Markdown or MDX capability changes, update both `shared/content/blog/fr/demo-fonctionnalites.mdx` and its English mirror.

## Visual and behavioral changes

A shared capability must remain available in `_core` and all six public variants. Preserve semantic HTML, keyboard navigation, focus visibility, reduced-motion behavior, light and dark themes, responsive layouts, and reload-free Astro language transitions.

Use `bun run preview:all` to build and compare every public variant. Check the feature demo, a bilingual route, and the 404 page. Both the development terminal and browser console must remain free of warnings and errors on normal pages.

## Validation

Run the project checks before opening a pull request:

```bash
bun run check:all
bun run preview:all
```

For a shared or variant-level change, also build every affected package. A pull request is ready when links and assets resolve, all builds pass, the FR/EN pair is complete, and no generated or ignored files are staged.

## Pull request checklist

- Describe the user-visible outcome and the owner files changed.
- Add screenshots for visual changes and reproduction steps for bug fixes.
- State which variants, locales, routes, themes, viewport sizes, and keyboard flows were tested.
- Mention any intentional limitation or follow-up explicitly.
- Keep the pull request focused and use a clear title in the imperative mood.

By contributing, you agree that your work is released under the repository's MIT license.
