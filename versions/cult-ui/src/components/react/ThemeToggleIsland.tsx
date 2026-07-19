import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

interface ThemeToggleIslandProps {
  label: string;
}

const DURATION = 500;

type StartViewTransition = (callback: () => void) => {
  ready: Promise<void>;
  finished: Promise<void>;
};

export function ThemeToggleIsland({ label }: ThemeToggleIslandProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const applyTheme = useCallback(() => {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    window.__applyAccent?.();
  }, []);

  const toggle = useCallback(() => {
    const button = buttonRef.current;
    const startViewTransition = (
      document as Document & { startViewTransition?: StartViewTransition }
    ).startViewTransition;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      !button ||
      typeof startViewTransition !== "function" ||
      prefersReducedMotion
    ) {
      applyTheme();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );
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
      onClick={toggle}
      className="h-11 w-11"
    >
      <Sun
        size={20}
        aria-hidden="true"
        className="hidden text-foreground dark:block"
      />
      <Moon
        size={20}
        aria-hidden="true"
        className="block text-foreground dark:hidden"
      />
    </TextureButton>
  );
}

export default ThemeToggleIsland;
