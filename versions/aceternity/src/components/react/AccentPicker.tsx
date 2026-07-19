"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Palette } from "lucide-react";


export interface AccentPickerLabels {
  open: string;
  title: string;
  saturation: string;
  saturationValue: string;
  hue: string;
  hueValue: string;
  reset: string;
}

export interface AccentPickerProps {
  labels: AccentPickerLabels;
  defaultAccent: string;
}

declare global {
  interface Window {
    applyAccent?: () => void;
  }
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}

function hexToHsv(hex: string): Hsv {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
}

function hsvToHex({ h, s, v }: Hsv): string {
  const hh = Number.isFinite(h) ? ((h % 360) + 360) % 360 : 0;
  const ss = clamp(Number.isFinite(s) ? s : 0, 0, 100) / 100;
  const vv = clamp(Number.isFinite(v) ? v : 0, 0, 100) / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  const sector = Math.floor(hh / 60);
  const parts: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = parts[Math.min(sector, 5)];
  return (
    "#" +
    [r, g, b]
      .map((u) =>
        Math.round((u + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function readStoredAccent(fallback: string): string {
  try {
    const stored = localStorage.getItem("accent");
    return stored && /^#[0-9a-fA-F]{6}$/.test(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

export default function AccentPicker({
  labels,
  defaultAccent,
}: AccentPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(defaultAccent));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;

  const hex = hsvToHex(hsv);

  useEffect(() => {
    setHsv(hexToHsv(readStoredAccent(defaultAccent)));
  }, [defaultAccent]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    svRef.current?.focus();
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const commit = (next: Hsv) => {
    const hex = hsvToHex(next);
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return;
    setHsv(next);
    try {
      localStorage.setItem("accent", hex);
    } catch {
    }
    window.applyAccent?.();
  };

  const reset = () => {
    setHsv(hexToHsv(defaultAccent));
    try {
      localStorage.removeItem("accent");
    } catch {
    }
    window.applyAccent?.();
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const svFromPointer = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    commit({
      h: hsvRef.current.h,
      s: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp((1 - (clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  };

  const hueFromPointer = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    commit({
      ...hsvRef.current,
      h: clamp(((clientX - rect.left) / rect.width) * 360, 0, 360),
    });
  };

  const capturePointer = (target: Element, pointerId: number) => {
    try {
      target.setPointerCapture(pointerId);
    } catch {
    }
  };

  const sRound = Math.round(hsv.s);
  const vRound = Math.round(hsv.v);
  const hRound = Math.round(hsv.h);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close(false) : setOpen(true))}
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Palette className="h-5 w-5" aria-hidden="true" />
      </button>

      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-label={labels.title}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 mt-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg"
            >
              { }
              <div
                ref={svRef}
                role="slider"
                tabIndex={0}
                aria-label={labels.saturation}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sRound}
                aria-valuetext={fill(labels.saturationValue, {
                  s: sRound,
                  v: vRound,
                })}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.focus();
                  capturePointer(event.currentTarget, event.pointerId);
                  svFromPointer(event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    svFromPointer(event.clientX, event.clientY);
                  }
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 10 : 2;
                  let { h, s, v } = hsvRef.current;
                  if (event.key === "ArrowLeft") s -= step;
                  else if (event.key === "ArrowRight") s += step;
                  else if (event.key === "ArrowUp") v += step;
                  else if (event.key === "ArrowDown") v -= step;
                  else return;
                  event.preventDefault();
                  commit({ h, s: clamp(s, 0, 100), v: clamp(v, 0, 100) });
                }}
                className="relative h-[140px] w-[180px] cursor-crosshair rounded-md"
                style={{
                  touchAction: "none",
                  backgroundColor: `hsl(${hRound} 100% 50%)`,
                  backgroundImage:
                    "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)]"
                  style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    backgroundColor: hex,
                  }}
                />
              </div>

              { }
              <div
                ref={hueRef}
                role="slider"
                tabIndex={0}
                aria-label={labels.hue}
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={hRound}
                aria-valuetext={fill(labels.hueValue, { h: hRound })}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.focus();
                  capturePointer(event.currentTarget, event.pointerId);
                  hueFromPointer(event.clientX);
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    hueFromPointer(event.clientX);
                  }
                }}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 10 : 2;
                  let { h } = hsvRef.current;
                  if (event.key === "ArrowLeft" || event.key === "ArrowDown")
                    h -= step;
                  else if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowUp"
                  )
                    h += step;
                  else return;
                  event.preventDefault();
                  commit({ ...hsvRef.current, h: clamp(h, 0, 360) });
                }}
                className="relative mt-3 h-3 w-[180px] cursor-ew-resize rounded-full"
                style={{
                  touchAction: "none",
                  background:
                    "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)]"
                  style={{
                    left: `${(hsv.h / 360) * 100}%`,
                    backgroundColor: `hsl(${hRound} 100% 50%)`,
                  }}
                />
              </div>

              { }
              <div className="mt-3 flex items-center justify-between gap-3">
                <code className="font-mono text-xs text-muted-foreground">
                  {hex}
                </code>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-sm text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                >
                  {labels.reset}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
