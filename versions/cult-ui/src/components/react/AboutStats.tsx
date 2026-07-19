import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  TextureCard,
  TextureCardContent,
} from "@/components/ui/texture-card";

interface AboutStat {
  value: number;
  label: string;
}

interface AboutStatsProps {
  locale: string;
  title: string;
  stats: AboutStat[];
}

export function AboutStats({ locale, title, stats }: AboutStatsProps) {
  const [started, setStarted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section aria-label={title}>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <TextureCard key={stat.label}>
            <TextureCardContent className="flex flex-col items-start gap-1 px-5 py-4">
              <span className="font-mono text-3xl font-bold tracking-tight text-accent">
                {reduced ? (
                  new Intl.NumberFormat(locale).format(stat.value)
                ) : (
                  <AnimatedNumber locale={locale} value={started ? stat.value : 0} />
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
            </TextureCardContent>
          </TextureCard>
        ))}
      </div>
    </section>
  );
}

export default AboutStats;
