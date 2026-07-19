import React from "react";
import LogoLoop, { type LogoItem } from "@/components/ui/LogoLoop";

const STACK = [
  "Astro",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Bun",
  "GSAP",
  "Motion",
  "Pagefind",
] as const;

const logos: LogoItem[] = STACK.map((name) => ({
  node: (
    <span className="whitespace-nowrap font-mono text-sm font-medium text-muted-foreground">
      {name}
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

interface TechLogoLoopProps {
  ariaLabel: string;
}

export default function TechLogoLoop({ ariaLabel }: TechLogoLoopProps) {
  return (
    <LogoLoop
      logos={logos}
      speed={40}
      gap={48}
      logoHeight={20}
      pauseOnHover
      fadeOut
      fadeOutColor="var(--color-background)"
      ariaLabel={ariaLabel}
    />
  );
}
