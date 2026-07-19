import { Lens } from "@/components/ui/lens";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import { rgba, useAccentRgb } from "@/lib/cyber";


interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export default function LensFigure({ src, alt, width, height, caption }: Props) {
  const accent = useAccentRgb();

  return (
    <figure className="hud-corners relative overflow-hidden border border-border/70 bg-card/40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        <GlyphMatrix
          cellSize={16}
          mutationRate={0.03}
          interval={120}
          fadeBottom={0.75}
          color={rgba(accent, 0.35)}
        />
      </div>
      <div className="relative p-4">
        <Lens zoomFactor={1.8} lensSize={150} lensColor="var(--color-background)">
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full bg-background/70"
          />
        </Lens>
      </div>
      <figcaption className="border-t border-border/70 bg-background/70 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="text-accent" aria-hidden="true">
          &gt;{" "}
        </span>
        {caption}
      </figcaption>
    </figure>
  );
}
