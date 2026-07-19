import { useEffect, useRef } from "react";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { useAccentRgb } from "@/lib/cyber";


const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function KonamiEgg() {
  const confettiRef = useRef<ConfettiRef>(null);
  const accent = useAccentRgb();
  const accentRef = useRef(accent);
  accentRef.current = accent;

  useEffect(() => {
    let progress = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress < KONAMI.length) return;
      progress = 0;
      const { r, g, b } = accentRef.current;
      const light = (v: number) => Math.round(v + (255 - v) * 0.6);
      const dark = (v: number) => Math.round(v * 0.6);
      const colors = [
        `rgb(${r}, ${g}, ${b})`,
        `rgb(${light(r)}, ${light(g)}, ${light(b)})`,
        `rgb(${dark(r)}, ${dark(g)}, ${dark(b)})`,
      ];
      const fire = (x: number, angle: number) =>
        confettiRef.current?.fire({
          particleCount: 90,
          spread: 65,
          startVelocity: 42,
          origin: { x, y: 0.7 },
          angle,
          colors,
        });
      fire(0.12, 60);
      fire(0.88, 120);
      window.setTimeout(() => fire(0.5, 90), 220);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Confetti
      ref={confettiRef}
      manualstart
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] h-full w-full"
    />
  );
}
