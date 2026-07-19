import { createRef, useRef } from "react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";


interface Props {
  core: string;
  modules: string[];
}

function Node({
  label,
  nodeRef,
  className,
}: {
  label: string;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <div
      ref={nodeRef}
      className={cn(
        "z-10 flex items-center justify-center border border-border bg-card/85 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </div>
  );
}

export default function AboutBeams({ core, modules }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const moduleRefs = useRef(modules.map(() => createRef<HTMLDivElement>()));

  const mid = Math.ceil(modules.length / 2);
  const left = modules.slice(0, mid);
  const right = modules.slice(mid);

  return (
    <div
      ref={containerRef}
      className="relative flex h-72 w-full items-center justify-between overflow-hidden border border-border/70 bg-card/30 px-6 py-8 md:px-10"
    >
      <div className="flex flex-col justify-between gap-4 self-stretch">
        {left.map((label, i) => (
          <Node key={label} label={label} nodeRef={moduleRefs.current[i]} />
        ))}
      </div>

      <div
        ref={coreRef}
        className="hud-corners z-10 flex h-16 w-24 items-center justify-center border border-accent/70 bg-background/85 font-display text-sm font-bold uppercase tracking-widest text-accent shadow-[var(--glow-md)]"
      >
        {core}
      </div>

      <div className="flex flex-col justify-between gap-4 self-stretch">
        {right.map((label, i) => (
          <Node key={label} label={label} nodeRef={moduleRefs.current[mid + i]} />
        ))}
      </div>

      {modules.map((label, i) => (
        <AnimatedBeam
          key={label}
          containerRef={containerRef}
          fromRef={moduleRefs.current[i]}
          toRef={coreRef}
          curvature={i % 2 === 0 ? 40 : -40}
          reverse={i >= mid}
          duration={4 + i}
          pathColor="var(--color-border)"
          pathOpacity={0.4}
          gradientStartColor="var(--color-accent)"
          gradientStopColor="var(--color-accent)"
        />
      ))}
    </div>
  );
}
