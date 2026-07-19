import { useCallback, useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

declare global {
  interface Window {
    __applyAccent?: () => void;
  }
}


interface AccentPickerProps {
  defaultAccent: string;
  labels: {
    open: string;
    title: string;
    saturation: string;
    saturationValue: string;
    hue: string;
    hueValue: string;
    reset: string;
  };
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}


function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : (delta / max) * 100;
  return { h, s, v: max * 100 };
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((n) => (n + m) * 255) as [number, number, number];
}

function hexToHsv(hex: string): Hsv {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex({ h, s, v }: Hsv): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function storedAccent(fallback: string): string {
  try {
    const raw = localStorage.getItem("accent");
    if (raw && /^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  } catch {
  }
  return fallback;
}

export function AccentPicker({ defaultAccent, labels }: AccentPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(defaultAccent));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const hex = hsvToHex(hsv);
  const hue = Math.round(hsv.h) % 360;
  const sat = Math.round(hsv.s);
  const val = Math.round(hsv.v);

  useEffect(() => {
    setHsv(hexToHsv(storedAccent(defaultAccent)));
  }, [defaultAccent]);

  useEffect(() => {
    if (!open) return;
    squareRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const commit = useCallback((next: Hsv) => {
    setHsv(next);
    try {
      localStorage.setItem("accent", hsvToHex(next));
    } catch {
    }
    window.__applyAccent?.();
  }, []);

  function reset() {
    setHsv(hexToHsv(defaultAccent));
    try {
      localStorage.removeItem("accent");
    } catch {
    }
    window.__applyAccent?.();
  }


  const pickFromSquare = useCallback(
    (clientX: number, clientY: number) => {
      const rect = squareRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
      commit({ h: hsv.h, s, v });
    },
    [commit, hsv.h],
  );

  function onSquarePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    squareRef.current?.focus();
    pickFromSquare(event.clientX, event.clientY);
  }

  function onSquarePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    pickFromSquare(event.clientX, event.clientY);
  }

  function onSquareKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = 2;
    let s = hsv.s;
    let v = hsv.v;
    if (event.key === "ArrowLeft") s -= step;
    else if (event.key === "ArrowRight") s += step;
    else if (event.key === "ArrowUp") v += step;
    else if (event.key === "ArrowDown") v -= step;
    else return;
    event.preventDefault();
    commit({ h: hsv.h, s: clamp(s, 0, 100), v: clamp(v, 0, 100) });
  }


  const pickFromHueBar = useCallback(
    (clientX: number) => {
      const rect = hueRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
      commit({ h, s: hsv.s, v: hsv.v });
    },
    [commit, hsv.s, hsv.v],
  );

  function onHuePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    hueRef.current?.focus();
    pickFromHueBar(event.clientX);
  }

  function onHuePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    pickFromHueBar(event.clientX);
  }

  function onHueKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = 5;
    let h = hsv.h;
    if (event.key === "ArrowLeft") h -= step;
    else if (event.key === "ArrowRight") h += step;
    else return;
    event.preventDefault();
    commit({ h: clamp(h, 0, 360), s: hsv.s, v: hsv.v });
  }

  const pureHue = `hsl(${hue} 100% 50%)`;
  const squareBackground = [
    "linear-gradient(to top, #000, transparent)",
    `linear-gradient(to right, #fff, ${pureHue})`,
  ].join(", ");
  const hueBackground =
    "linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))";
  const cursorRing =
    "inset 0 0 0 2px #fff, 0 0 0 1px rgb(0 0 0 / 0.55), inset 0 0 2px 2px rgb(0 0 0 / 0.35)";

  return (
    <div ref={rootRef} className="relative">
      <TextureButton
        ref={triggerRef}
        variant="icon"
        size="icon"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="h-11 w-11"
      >
        <Palette size={20} aria-hidden="true" className="text-foreground" />
      </TextureButton>

      {open && (
        <div
          role="dialog"
          aria-label={labels.title}
          className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-[0_16px_40px_-12px_rgb(0_0_0/0.4)]"
        >
          { }
          <div
            ref={squareRef}
            role="slider"
            tabIndex={0}
            aria-label={labels.saturation}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sat}
            aria-valuetext={labels.saturationValue.replace("{s}", String(sat)).replace("{v}", String(val))}
            onPointerDown={onSquarePointerDown}
            onPointerMove={onSquarePointerMove}
            onKeyDown={onSquareKeyDown}
            className="relative h-[140px] w-[180px] cursor-crosshair touch-none rounded-md border border-border"
            style={{ background: squareBackground }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                backgroundColor: hex,
                boxShadow: cursorRing,
              }}
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
            aria-valuenow={hue}
            aria-valuetext={labels.hueValue.replace("{h}", String(hue))}
            onPointerDown={onHuePointerDown}
            onPointerMove={onHuePointerMove}
            onKeyDown={onHueKeyDown}
            className="relative mt-3 h-3.5 w-[180px] cursor-ew-resize touch-none rounded-full"
            style={{ background: hueBackground }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: pureHue,
                boxShadow: cursorRing,
              }}
            />
          </div>

          { }
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">{hex}</span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {labels.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccentPicker;
