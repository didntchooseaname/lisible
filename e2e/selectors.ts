import type { Locator, Page } from "@playwright/test";

/**
 * Cross-variant locator helpers.
 *
 * The six variants share features and i18n strings but not their markup:
 * some render controls as Astro components with data hooks, others as React
 * islands exposing only roles and aria-labels, and aceternity has no <header>
 * element at all. These helpers target the accessible contract (roles, labels,
 * shared data hooks) and reduce to the first visible match because several
 * variants render desktop plus mobile duplicates of the same control.
 */

function firstVisible(locator: Locator): Locator {
  return locator.filter({ visible: true }).first();
}

export function searchTrigger(page: Page): Locator {
  return firstVisible(page.locator("[data-search-open]"));
}

/**
 * The currently open search or palette dialog. cult-ui mounts the command
 * palette on its own dialog next to the plain search modal, so the [open]
 * attribute targets whichever one is actually shown.
 */
export function searchModal(page: Page): Locator {
  return page.locator("[data-search-modal][open]");
}

export function searchInput(page: Page): Locator {
  // The input hook differs (data-search-input, data-cp-input); every variant
  // has exactly one input inside the open dialog.
  return page.locator("[data-search-modal][open] input").first();
}

export function themeToggle(page: Page): Locator {
  // organique, h4x0r, motion-primitives and reactbits expose [data-theme-toggle];
  // cult-ui and aceternity render React buttons identified only by their
  // accessible name (every FR label contains the word "thème").
  return firstVisible(page.locator("[data-theme-toggle], button[aria-label*='thème' i]"));
}

export function accentTrigger(page: Page): Locator {
  // Astro pickers use data hooks ([data-accent-open] or [data-accent-toggle]);
  // the React pickers of motion-primitives, cult-ui and aceternity expose a
  // popup button whose label contains "couleur" ("... la couleur d'accent").
  return firstVisible(
    page.locator(
      "[data-accent-open], [data-accent-toggle], button[aria-haspopup][aria-label*='couleur' i]",
    ),
  );
}

/** The two color surfaces of the opened accent picker. */
export function visibleSliders(page: Page): Locator {
  return page.getByRole("slider").filter({ visible: true });
}

export function hueSlider(page: Page): Locator {
  // Shared FR label across all six variants.
  return firstVisible(page.getByRole("slider", { name: "Teinte" }));
}

export function accentReset(page: Page): Locator {
  // Exact match so the palette entry "Réinitialiser la couleur d'accent"
  // can never be picked up.
  return firstVisible(page.getByRole("button", { name: "Réinitialiser", exact: true }));
}

export function langLink(page: Page, locale: "fr" | "en"): Locator {
  return firstVisible(page.locator(`a[hreflang='${locale}']`));
}

export function navLink(page: Page, name: string): Locator {
  return firstVisible(page.getByRole("link", { name }));
}

export function homeLink(page: Page): Locator {
  return firstVisible(page.locator("a[href='/']"));
}

/**
 * Mermaid hooks. The lazy container is [data-mermaid] or
 * [data-mermaid-container] depending on the variant; the rendered SVG is
 * always injected as the direct child of [data-mermaid-render]
 * ([data-diagram-pan] in h4x0r), which never holds toolbar icons.
 */
export const MERMAID_BLOCK = "[data-mermaid], [data-mermaid-container]";
export const MERMAID_SVG = ":is([data-mermaid-render], [data-diagram-pan]) > svg";
