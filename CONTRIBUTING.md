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

The repository is a Bun workspace: one `bun install` at the root installs the tooling, the shared core and all seven build targets at once. Never run `bun install` inside a `versions/<variant>/` directory; the root lockfile is the only one.

TypeScript stays on the 6.x line for now: `astro check` relies on a compiler API that the native TypeScript 7 compiler does not expose yet (see the Astro roadmap discussion linked from the error message if you try). Do not bump it until `@astrojs/check` supports 7.

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

Run the project checks before opening a pull request. CI runs all of them, so running them locally first saves a round trip:

```bash
bun x biome ci .          # lint and format, zero diagnostics expected
bun test                  # unit tests, including the markdown transformer suite
bun scripts/check-style.ts # editorial rules (no long dashes, no AI mentions)
bun run check:all         # per target: typecheck, build, links, assets, Open Graph
bun run preview:all       # build and compare every public variant by hand
```

For a shared or variant-level change, also build every affected package. A pull request is ready when links and assets resolve, all builds pass, the FR/EN pair is complete, and no generated or ignored files are staged.

### Conformance

`bun run check-conformance` verifies that the seven build targets stay structurally aligned: same routes, same content imports, same feature flag wiring. Any deliberate deviation must be declared in `conformance-exceptions.json` with a reason; an undeclared one fails CI.

### Rendering drift

`.drift-baseline.json` is a committed snapshot of the normalized HTML hashes of every page in every target. It is the safety net for refactors that must not change the rendered output:

1. Build the seven targets, then run `bun run check-drift`. Green means your change did not alter a single rendered byte.
2. If your change legitimately alters the output (content edit, new feature, dependency bump), rerun with `bun run check-drift --save`: it refuses to overwrite a diverging baseline and prints the differing pages first. Review that list, confirm it matches exactly what your change is supposed to touch, then accept it with `--save --force` and commit the updated baseline together with the change.

A drift list wider than the scope of your change is a regression, not a formality.

## Commit style

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`, `refactor:`); releases are cut automatically from them by release-please, so the prefix decides the version bump. Keep titles short, factual and in the imperative mood.

## Pull request checklist

- Describe the user-visible outcome and the owner files changed.
- Add screenshots for visual changes and reproduction steps for bug fixes.
- State which variants, locales, routes, themes, viewport sizes, and keyboard flows were tested.
- Mention any intentional limitation or follow-up explicitly.
- Keep the pull request focused and use a clear title in the imperative mood.

By contributing, you agree that your work is released under the repository's MIT license.
