import { memo, useEffect, useState } from "react";
import { SmoothCursor } from "@/components/ui/smooth-cursor";


function CyberReticle() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-accent"
      style={{ filter: "drop-shadow(0 0 6px var(--neon-45))" }}
    >
      <circle cx="17" cy="17" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" />
      <path d="M17 2v7M17 25v7M2 17h7M25 17h7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const SmartCursor = memo(function SmartCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("cyber-cursor", enabled);
    return () => document.documentElement.classList.remove("cyber-cursor");
  }, [enabled]);

  if (!enabled) return null;
  return (
    <SmoothCursor
      cursor={<CyberReticle />}
      springConfig={{ damping: 42, stiffness: 380, mass: 1, restDelta: 0.001 }}
    />
  );
});

export default SmartCursor;
