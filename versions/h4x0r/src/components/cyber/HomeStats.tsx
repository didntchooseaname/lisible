import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";


interface Stat {
  value: number;
  label: string;
}

interface Props {
  locale: string;
  stats: Stat[];
  integrityLabel: string;
}

export default function HomeStats({ locale, stats, integrityLabel }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="hud-corners border border-border/70 bg-card/60 px-4 py-5 backdrop-blur-sm"
        >
          <NumberTicker
            value={stat.value}
            locale={locale}
            className="font-display text-3xl font-bold tracking-tight text-foreground"
          />
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
      <div className="hud-corners col-span-2 flex items-center gap-4 border border-border/70 bg-card/60 px-4 py-5 backdrop-blur-sm sm:col-span-1 lg:col-span-2">
        <AnimatedCircularProgressBar
          value={100}
          gaugePrimaryColor="var(--color-accent)"
          gaugeSecondaryColor="var(--neon-12)"
          className="size-16 shrink-0 text-base"
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {integrityLabel}
        </p>
      </div>
    </div>
  );
}
