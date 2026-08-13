/**
 * Three state theme preference: light, dark, or following the system. The
 * inline appearance bootstrap owns the initial paint and the reactions to
 * storage and media changes; this module owns the user driven cycle and
 * mirrors the exact attributes the bootstrap maintains, so both writers stay
 * interchangeable within a page's lifetime.
 */

export type ThemePreference = "light" | "dark" | "system";

const ORDER: readonly ThemePreference[] = ["light", "dark", "system"];

export function currentPreference(): ThemePreference {
  const value = document.documentElement.dataset.theme;
  return value === "light" || value === "dark" ? value : "system";
}

export function nextPreference(current: ThemePreference = currentPreference()): ThemePreference {
  return ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
}

/** Persist and apply a preference; returns whether the page is now dark. */
export function applyPreference(preference: ThemePreference): boolean {
  const root = document.documentElement;
  try {
    if (preference === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", preference);
  } catch {
    // Private mode: the preference still applies to the current page.
  }
  const dark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.dataset.theme = preference;
  root.dataset.resolvedTheme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
  (window as { __applyAccent?: () => void }).__applyAccent?.();
  return dark;
}

/** Advance to the next preference and return it. */
export function cyclePreference(): ThemePreference {
  const next = nextPreference();
  applyPreference(next);
  return next;
}
