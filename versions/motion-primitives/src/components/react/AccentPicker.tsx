import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { PaletteIcon } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";

declare global {
  interface Window {
    __applyAccent?: () => void;
  }
}

type AccentPickerProps = {
  defaultAccent: string;
  labels: {
    trigger: string;
    title: string;
    area: string;
    areaValue: string;
    hue: string;
    hueValue: string;
    reset: string;
  };
};

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

const HEX_RE = /^#[0-9a-f]{6}$/i;

type Hsv = { h: number; s: number; v: number };


function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)].map((x) => Math.round(x * 255)) as [number, number, number];
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hexToHsv(hex: string): Hsv {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return rgbToHsv(r, g, b);
}

function hsvToHex(hsv: Hsv): string {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  const [r, g, b] = hsvToRgb(hsv);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function AccentPicker({ defaultAccent, labels }: AccentPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(defaultAccent));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"area" | "hue" | null>(null);
  const popoverId = useId();

  const hex = hsvToHex(hsv);
  const hueDeg = Math.round(hsv.h);
  const satPct = Math.round(hsv.s * 100);
  const valPct = Math.round(hsv.v * 100);

  useEffect(() => {
    const stored = localStorage.getItem("accent");
    if (stored && HEX_RE.test(stored)) setHsv(hexToHsv(stored));
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef as RefObject<HTMLDivElement>, close);

  useEffect(() => {
    if (open) areaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function commit(next: Hsv) {
    setHsv(next);
    localStorage.setItem("accent", hsvToHex(next));
    window.__applyAccent?.();
  }

  function reset() {
    setHsv(hexToHsv(defaultAccent));
    localStorage.removeItem("accent");
    window.__applyAccent?.();
  }


  function readArea(event: ReactPointerEvent<HTMLDivElement>): Hsv {
    const rect = areaRef.current!.getBoundingClientRect();
    return {
      h: hsv.h,
      s: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      v: 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function onAreaPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
    }
    event.currentTarget.focus();
    dragRef.current = "area";
    commit(readArea(event));
  }

  function onAreaPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current !== "area") return;
    commit(readArea(event));
  }

  function onAreaKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = 0.02;
    let { s, v } = hsv;
    switch (event.key) {
      case "ArrowLeft":
        s = clamp(s - step, 0, 1);
        break;
      case "ArrowRight":
        s = clamp(s + step, 0, 1);
        break;
      case "ArrowUp":
        v = clamp(v + step, 0, 1);
        break;
      case "ArrowDown":
        v = clamp(v - step, 0, 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    commit({ h: hsv.h, s, v });
  }


  function readHue(event: ReactPointerEvent<HTMLDivElement>): Hsv {
    const rect = hueRef.current!.getBoundingClientRect();
    const h = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 360;
    return { h: Math.min(h, 359.9), s: hsv.s, v: hsv.v };
  }

  function onHuePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
    }
    event.currentTarget.focus();
    dragRef.current = "hue";
    commit(readHue(event));
  }

  function onHuePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current !== "hue") return;
    commit(readHue(event));
  }

  function endDrag() {
    dragRef.current = null;
  }

  function onHueKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = 3;
    let h = hsv.h;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        h = clamp(h - step, 0, 359.9);
        break;
      case "ArrowRight":
      case "ArrowUp":
        h = clamp(h + step, 0, 359.9);
        break;
      default:
        return;
    }
    event.preventDefault();
    commit({ h, s: hsv.s, v: hsv.v });
  }

  const hueColor = `hsl(${hueDeg} 100% 50%)`;
  const cursorRing =
    "pointer-events-none absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.55)]";

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-label={labels.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <PaletteIcon size={20} aria-hidden="true" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id={popoverId}
              role="dialog"
              aria-label={labels.title}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full z-50 mt-2 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg"
            >
              { }
              <div
                ref={areaRef}
                role="slider"
                tabIndex={0}
                aria-label={labels.area}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={satPct}
                aria-valuetext={fill(labels.areaValue, { s: satPct, v: valPct })}
                onPointerDown={onAreaPointerDown}
                onPointerMove={onAreaPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onKeyDown={onAreaKeyDown}
                className="relative h-[140px] w-[180px] cursor-crosshair touch-none rounded-md border border-border"
                style={{
                  background: `linear-gradient(to top, #000, rgb(0 0 0 / 0)), linear-gradient(to right, #fff, ${hueColor})`,
                }}
              >
                <div
                  className={`${cursorRing} -translate-x-1/2 translate-y-1/2`}
                  style={{
                    left: `${satPct}%`,
                    bottom: `${valPct}%`,
                    backgroundColor: hex,
                  }}
                  aria-hidden="true"
                />
              </div>

              { }
              <div
                ref={hueRef}
                role="slider"
                tabIndex={0}
                aria-label={labels.hue}
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={hueDeg}
                aria-valuetext={fill(labels.hueValue, { deg: hueDeg })}
                onPointerDown={onHuePointerDown}
                onPointerMove={onHuePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onKeyDown={onHueKeyDown}
                className="relative mt-3 h-3.5 w-[180px] touch-none rounded-full border border-border"
                style={{
                  background:
                    "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
                }}
              >
                <div
                  className={`${cursorRing} top-1/2 -translate-x-1/2 -translate-y-1/2`}
                  style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColor }}
                  aria-hidden="true"
                />
              </div>

              { }
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
                  {hex}
                </span>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-sm px-1.5 py-1 text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
                >
                  {labels.reset}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
