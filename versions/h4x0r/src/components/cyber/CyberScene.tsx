import { useEffect, useRef } from "react";
import { currentAccentRgb, isDarkTheme, type Rgb } from "@/lib/cyber";


type Wave = { x: number; y: number; born: number };

type Column = {
  head: number;
  speed: number;
  len: number;
};

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/*+=#$%&@";

function readMode(): number {
  return document.body?.dataset.cyberScene === "calm" ? 0 : 1;
}

export default function CyberScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const cell = coarse ? 26 : 20;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let columns: Column[] = [];
    let chars: string[] = [];
    let raf = 0;
    let last = performance.now();
    let lastMutation = 0;
    let running = false;

    let accent: Rgb = { r: 34, g: 197, b: 94 };
    let dark = true;

    let intensity = readMode();
    let targetIntensity = intensity;

    const mouse = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4 };
    const waves: Wave[] = [];
    let scrollY = window.scrollY;

    const refreshTheme = () => {
      accent = currentAccentRgb();
      dark = isDarkTheme();
      if (reduced) drawStatic();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 2;
      columns = Array.from({ length: cols }, () => ({
        head: Math.random() * (h + 400) - 200,
        speed: 50 + Math.random() * 110,
        len: 8 + Math.floor(Math.random() * 14),
      }));
      chars = Array.from(
        { length: cols * rows },
        () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      );
      if (reduced) drawStatic();
    };

    const glyphAt = (c: number, r: number) =>
      chars[((r % rows) + rows) % rows * cols + c] ?? "0";

    const drawGrid = (t: number) => {
      const step = cell * 4;
      const offset = (scrollY * 0.05) % step;
      const base = dark ? 0.055 : 0.09;
      const alpha = base * (0.55 + 0.45 * intensity);
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0.5; x <= w + step; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0.5 - offset; y <= h + step; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      if (mouse.sx > -5000) {
        const spot = dark ? 0.1 : 0.06;
        const radius = 280;
        const gradient = ctx.createRadialGradient(
          mouse.sx,
          mouse.sy,
          0,
          mouse.sx,
          mouse.sy,
          radius,
        );
        gradient.addColorStop(
          0,
          `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${spot * (0.35 + 0.65 * intensity)})`,
        );
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.sx - radius, mouse.sy - radius, radius * 2, radius * 2);
      }

      for (const wave of waves) {
        const age = (t - wave.born) / 1000;
        if (age <= 0 || age > 1.15) continue;
        const radius = age * 520;
        const fade = (1 - age / 1.15) * 0.4;
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${fade})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawRain = (t: number) => {
      ctx.font = `${cell - 6}px "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const dim = dark ? 1 : 0.55;
      const globalDim = (0.3 + 0.7 * intensity) * dim;
      const parallax = (scrollY * 0.12) % cell;
      const centerBand = intensity < 0.65;
      const cx = w / 2;

      for (let c = 0; c < cols; c++) {
        const col = columns[c];
        const x = c * cell + cell / 2;

        let columnDim = 1;
        if (centerBand) {
          const d = Math.abs(x - cx);
          if (d < 520) columnDim = 0.3 + 0.7 * (d / 520);
        }

        const headRow = Math.floor((col.head - parallax) / cell);
        for (let i = 0; i < col.len; i++) {
          const r = headRow - i;
          const y = r * cell + cell / 2 + parallax;
          if (y < -cell || y > h + cell) continue;

          const falloff = Math.pow(1 - i / col.len, 1.7);
          let alpha = falloff * 0.6 * globalDim * columnDim;
          let ox = 0;
          let oy = 0;

          const dxm = x - mouse.sx;
          const dym = y - mouse.sy;
          const distSq = dxm * dxm + dym * dym;
          if (distSq < 180 * 180) {
            const dist = Math.sqrt(distSq) || 1;
            const force = Math.pow(1 - dist / 180, 2);
            const push = force * 26 * (0.4 + 0.6 * intensity);
            ox += (dxm / dist) * push;
            oy += (dym / dist) * push;
            alpha += force * 0.55 * dim;
          }

          for (const wave of waves) {
            const age = (t - wave.born) / 1000;
            if (age > 1.15) continue;
            const ring = age * 520;
            const dxw = x - wave.x;
            const dyw = y - wave.y;
            const dw = Math.sqrt(dxw * dxw + dyw * dyw) || 1;
            const band = 1 - Math.abs(dw - ring) / 90;
            if (band > 0) {
              const life = 1 - age / 1.15;
              alpha += band * life * 0.8 * dim;
              ox += (dxw / dw) * band * life * 14;
              oy += (dyw / dw) * band * life * 14;
            }
          }

          if (alpha <= 0.01) continue;
          alpha = Math.min(alpha, dark ? 0.95 : 0.8);

          if (i === 0) {
            const hr = dark ? Math.round(accent.r + (255 - accent.r) * 0.55) : accent.r;
            const hg = dark ? Math.round(accent.g + (255 - accent.g) * 0.55) : accent.g;
            const hb = dark ? Math.round(accent.b + (255 - accent.b) * 0.55) : accent.b;
            ctx.fillStyle = `rgba(${hr}, ${hg}, ${hb}, ${Math.min(1, alpha + 0.25)})`;
          } else {
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`;
          }
          ctx.fillText(glyphAt(c, r), x + ox, y + oy);
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      drawGrid(0);
      ctx.font = `${cell - 6}px "JetBrains Mono Variable", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const dim = dark ? 0.35 : 0.2;
      for (let c = 0; c < cols; c += 2) {
        for (let r = 0; r < rows; r += 3) {
          if ((c * 31 + r * 17) % 7 !== 0) continue;
          const alpha = (((c * 13 + r * 7) % 10) / 10) * dim;
          ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${alpha})`;
          ctx.fillText(glyphAt(c, r), c * cell + cell / 2, r * cell + cell / 2);
        }
      }
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      intensity += (targetIntensity - intensity) * Math.min(1, dt * 4);

      const ease = 1 - Math.exp(-dt * 9);
      mouse.sx += (mouse.x - mouse.sx) * ease;
      mouse.sy += (mouse.y - mouse.sy) * ease;

      const speedScale = 0.25 + 0.75 * intensity;
      for (const col of columns) {
        col.head += col.speed * speedScale * dt;
        if (col.head - col.len * cell > h + 200) {
          col.head = -Math.random() * 300;
          col.speed = 50 + Math.random() * 110;
          col.len = 8 + Math.floor(Math.random() * 14);
        }
      }

      if (t - lastMutation > 90) {
        lastMutation = t;
        const count = Math.max(4, Math.floor(cols * rows * 0.012));
        for (let i = 0; i < count; i++) {
          chars[Math.floor(Math.random() * chars.length)] =
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      for (let i = waves.length - 1; i >= 0; i--) {
        if (t - waves[i].born > 1200) waves.splice(i, 1);
      }

      ctx.clearRect(0, 0, w, h);
      drawGrid(t);
      drawRain(t);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const onPointerLeave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (waves.length > 5) waves.shift();
      waves.push({ x: event.clientX, y: event.clientY, born: performance.now() });
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    const onPageLoad = () => {
      targetIntensity = readMode();
      if (reduced) drawStatic();
    };

    const observer = new MutationObserver(refreshTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    refreshTheme();
    resize();
    onPageLoad();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("astro:page-load", onPageLoad);

    if (reduced) drawStatic();
    else start();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("astro:page-load", onPageLoad);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-cyber-canvas
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
