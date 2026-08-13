"use client";
import { announce } from "@shared/scripts/announce";
import { cyclePreference } from "@shared/scripts/theme-cycle";
import { Monitor, Moon, Search, Sun } from "lucide-react";
import { useRef, useState } from "react";
import AccentPicker, { type AccentPickerLabels } from "@/components/react/AccentPicker";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarLogo,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";

export interface HeaderNavProps {
  siteTitle: string;
  homeUrl: string;
  navLabel: string;
  items: { name: string; link: string; active?: boolean }[];
  searchLabel: string;
  themeLabel: string;
  themeLightOn: string;
  themeDarkOn: string;
  themeSystemOn: string;
  accentLabels: AccentPickerLabels;
  defaultAccent: string;
  langLabel: string;
  langItems: {
    code: string;
    label: string;
    ariaLabel: string;
    href: string;
    current: boolean;
  }[];
  menuOpenLabel: string;
  menuCloseLabel: string;
}

function applyThemeToggle(button: HTMLButtonElement | null) {
  const next = cyclePreference();
  const label =
    button?.dataset[
      next === "light" ? "announceLight" : next === "dark" ? "announceDark" : "announceSystem"
    ];
  if (label) announce(label);
}

function toggleThemeAnimated(button: HTMLButtonElement | null) {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!button || typeof document.startViewTransition !== "function" || prefersReducedMotion) {
    applyThemeToggle(button);
    return;
  }

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const { top, left, width, height } = button.getBoundingClientRect();
  const cx = left + width / 2;
  const cy = top + height / 2;
  const maxRadius = Math.hypot(Math.max(cx, viewportWidth - cx), Math.max(cy, viewportHeight - cy));
  const clipPath: [string, string] = [
    `circle(0px at ${cx}px ${cy}px)`,
    `circle(${maxRadius}px at ${cx}px ${cy}px)`,
  ];
  const duration = 500;

  const root = document.documentElement;
  root.dataset.themeVt = "active";
  root.style.setProperty("--theme-vt-duration", `${duration}ms`);
  root.style.setProperty("--theme-vt-clip-from", clipPath[0]);
  const cleanup = () => {
    delete root.dataset.themeVt;
    root.style.removeProperty("--theme-vt-duration");
    root.style.removeProperty("--theme-vt-clip-from");
  };

  const transition = document.startViewTransition(() => {
    applyThemeToggle(button);
  });

  if (typeof transition?.finished?.finally === "function") {
    transition.finished.finally(cleanup);
  } else {
    cleanup();
  }

  transition?.ready
    ?.then(() => {
      root.animate(
        { clipPath },
        {
          duration,
          easing: "ease-in-out",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}

const ThemeToggleButton = ({
  label,
  announceLabels,
}: {
  label: string;
  announceLabels: { light: string; dark: string; system: string };
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      type="button"
      ref={ref}
      data-theme-toggle
      data-announce-light={announceLabels.light}
      data-announce-dark={announceLabels.dark}
      data-announce-system={announceLabels.system}
      onClick={() => toggleThemeAnimated(ref.current)}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Sun className="tt-sun h-5 w-5" aria-hidden="true" />
      <Moon className="tt-moon h-5 w-5" aria-hidden="true" />
      <Monitor className="tt-monitor h-5 w-5" aria-hidden="true" />
    </button>
  );
};

const SearchButton = ({ label }: { label: string }) => (
  <button
    type="button"
    data-search-open
    aria-label={label}
    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  >
    <Search className="h-5 w-5" aria-hidden="true" />
  </button>
);

const LanguageSwitcher = ({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: HeaderNavProps["langItems"];
  onNavigate?: () => void;
}) => (
  <nav aria-label={label}>
    <ul className="flex items-center overflow-hidden rounded-md border border-border">
      {items.map((item) => (
        <li key={item.code}>
          <a
            href={item.href}
            lang={item.code}
            hrefLang={item.code}
            aria-label={item.ariaLabel}
            aria-current={item.current ? "true" : undefined}
            onClick={() => {
              localStorage.setItem("lisible-locale", item.code);
              onNavigate?.();
            }}
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center px-2.5 text-xs font-semibold tracking-wide transition-colors",
              item.current
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default function HeaderNav({
  siteTitle,
  homeUrl,
  navLabel,
  items,
  searchLabel,
  themeLabel,
  themeLightOn,
  themeDarkOn,
  themeSystemOn,
  accentLabels,
  defaultAccent,
  langLabel,
  langItems,
  menuOpenLabel,
  menuCloseLabel,
}: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Navbar>
      {}
      <NavBody>
        <NavbarLogo href={homeUrl} title={siteTitle} />
        <NavItems items={items} ariaLabel={navLabel} />
        <div className="relative z-20 flex items-center gap-1.5">
          <SearchButton label={searchLabel} />
          <LanguageSwitcher label={langLabel} items={langItems} />
          <AccentPicker labels={accentLabels} defaultAccent={defaultAccent} />
          <ThemeToggleButton
            label={themeLabel}
            announceLabels={{ light: themeLightOn, dark: themeDarkOn, system: themeSystemOn }}
          />
        </div>
      </NavBody>

      {}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href={homeUrl} title={siteTitle} />
          <div className="flex items-center gap-1">
            <SearchButton label={searchLabel} />
            <AccentPicker labels={accentLabels} defaultAccent={defaultAccent} />
            <ThemeToggleButton
              label={themeLabel}
              announceLabels={{ light: themeLightOn, dark: themeDarkOn, system: themeSystemOn }}
            />
            <MobileNavToggle
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              openLabel={menuOpenLabel}
              closeLabel={menuCloseLabel}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMenuOpen}>
          <nav aria-label={navLabel} className="w-full">
            <ul className="flex w-full flex-col">
              {items.map((item) => (
                <li key={item.link}>
                  <a
                    href={item.link}
                    onClick={closeMenu}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 w-full items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                      item.active && "text-foreground",
                    )}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-2 px-3">
            <LanguageSwitcher label={langLabel} items={langItems} onNavigate={closeMenu} />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
