import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useAccentRgb } from "@/lib/cyber";


export type OrbitTag = {
  name: string;
  url: string;
  count: number;
};

interface Props {
  tags: OrbitTag[];
  hubLabel: string;
}

function TagChip({ tag }: { tag: OrbitTag }) {
  return (
    <a
      href={tag.url}
      className="inline-flex items-center gap-1 whitespace-nowrap border border-border bg-card/85 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
    >
      <span className="text-accent" aria-hidden="true">
        #
      </span>
      {tag.name}
    </a>
  );
}

export default function TagOrbit({ tags, hubLabel }: Props) {
  const accent = useAccentRgb();
  const inner = tags.filter((_, i) => i % 2 === 0);
  const outer = tags.filter((_, i) => i % 2 === 1);

  return (
    <div className="relative flex h-[26rem] w-full items-center justify-center overflow-hidden border border-border/70 bg-card/30">
      <FlickeringGrid
        squareSize={3}
        gridGap={8}
        flickerChance={0.25}
        maxOpacity={0.16}
        color={`rgb(${accent.r}, ${accent.g}, ${accent.b})`}
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
      />

      <div className="hud-corners relative z-10 flex h-20 w-20 items-center justify-center border border-accent/60 bg-background/85 font-display text-sm font-bold uppercase tracking-widest text-accent shadow-[var(--glow-md)]">
        {hubLabel}
      </div>

      <OrbitingCircles radius={110} iconSize={44} speed={0.6} path>
        {inner.map((tag) => (
          <TagChip key={tag.url} tag={tag} />
        ))}
      </OrbitingCircles>
      <OrbitingCircles radius={175} iconSize={44} speed={0.4} reverse path>
        {outer.map((tag) => (
          <TagChip key={tag.url} tag={tag} />
        ))}
      </OrbitingCircles>
    </div>
  );
}
