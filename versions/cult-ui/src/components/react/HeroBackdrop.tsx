import { useEffect, useState } from "react";
import { StripeBgGuides } from "@/components/ui/stripe-bg-guides";

export function HeroBackdrop() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimated(!query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <StripeBgGuides
      contained
      columnCount={5}
      animated={animated}
      randomize
      maxActiveColumns={2}
      animationDuration={36}
      animationDelay={1.2}
      glowOpacity={0.35}
      glowSize="12vh"
      direction="top-to-bottom"
      easing="easeInOut"
    />
  );
}

export default HeroBackdrop;
