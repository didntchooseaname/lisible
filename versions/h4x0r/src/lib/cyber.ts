import { useEffect, useState } from "react";


export type Rgb = { r: number; g: number; b: number };

const FALLBACK: Rgb = { r: 34, g: 197, b: 94 };

let probeCtx: CanvasRenderingContext2D | null = null;

export function resolveCssColor(color: string, fallback: Rgb = FALLBACK): Rgb {
  if (typeof document === "undefined") return fallback;
  if (!probeCtx) {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    probeCtx = probe.getContext("2d", { willReadFrequently: true });
  }
  if (!probeCtx) return fallback;
  probeCtx.fillStyle = `rgb(${fallback.r} ${fallback.g} ${fallback.b})`;
  probeCtx.fillStyle = color;
  probeCtx.clearRect(0, 0, 1, 1);
  probeCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

export function currentAccentRgb(): Rgb {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim();
  return raw ? resolveCssColor(raw) : FALLBACK;
}

export function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function useAccentRgb(): Rgb {
  const [value, setValue] = useState<Rgb>(FALLBACK);
  useEffect(() => {
    const update = () => {
      const next = currentAccentRgb();
      setValue((prev) =>
        prev.r === next.r && prev.g === next.g && prev.b === next.b ? prev : next,
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    document.addEventListener("astro:page-load", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("astro:page-load", update);
    };
  }, []);
  return value;
}

export function useIsDark(): boolean {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}
