import { announce } from "@shared/scripts/announce";
import { cyclePreference } from "@shared/scripts/theme-cycle";
import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { TextureButton } from "@/components/ui/texture-button";

interface ThemeToggleIslandProps {
  label: string;
  themeLightOn: string;
  themeDarkOn: string;
  themeSystemOn: string;
}

const DURATION = 500;

type StartViewTransition = (callback: () => void) => {
  ready: Promise<void>;
  finished: Promise<void>;
};

export function ThemeToggleIsland({
  label,
  themeLightOn,
  themeDarkOn,
  themeSystemOn,
}: ThemeToggleIslandProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const applyTheme = useCallback(() => {
    const next = cyclePreference();
    announce(next === "light" ? themeLightOn : next === "dark" ? themeDarkOn : themeSystemOn);
  }, [themeLightOn, themeDarkOn, themeSystemOn]);

  const toggle = useCallback(() => {
    const button = buttonRef.current;
    const startViewTransition = (
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!button || typeof startViewTransition !== "function" || prefersReducedMotion) {
      applyTheme();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));
    const clipPath: [string, string] = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];

    const root = document.documentElement;
    root.dataset.themeVt = "active";
    root.style.setProperty("--theme-vt-clip-from", clipPath[0]);
    const cleanup = () => {
      delete root.dataset.themeVt;
      root.style.removeProperty("--theme-vt-clip-from");
    };

    const transition = startViewTransition.call(document, () => {
      flushSync(applyTheme);
    });
    transition.finished.finally(cleanup);
    transition.ready.then(() => {
      root.animate(
        { clipPath },
        {
          duration: DURATION,
          easing: "ease-in-out",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }, [applyTheme]);

  return (
    <TextureButton
      ref={buttonRef}
      variant="icon"
      size="icon"
      aria-label={label}
      data-theme-toggle
      onClick={toggle}
      className="h-11 w-11"
    >
      <Sun size={20} aria-hidden="true" className="tt-sun text-foreground" />
      <Moon size={20} aria-hidden="true" className="tt-moon text-foreground" />
      <Monitor size={20} aria-hidden="true" className="tt-monitor text-foreground" />
    </TextureButton>
  );
}

export default ThemeToggleIsland;
