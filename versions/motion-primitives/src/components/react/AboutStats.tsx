import { useRef } from "react";
import { MotionConfig, useInView } from "motion/react";
import { AnimatedNumber } from "@/components/ui/animated-number";

export type StatItem = {
  value: number;
  label: string;
};

type AboutStatsProps = {
  locale: string;
  title: string;
  stats: StatItem[];
};

export function AboutStats({ locale, title, stats }: AboutStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={title} ref={ref}>
        <dl className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-4 text-center md:p-6"
            >
              <dd className="text-3xl font-bold tracking-tight text-accent md:text-4xl">
                <AnimatedNumber
                  value={inView ? stat.value : 0}
                  locale={locale}
                  springOptions={{ stiffness: 80, damping: 22 }}
                />
              </dd>
              <dt className="mt-1 text-xs text-muted-foreground md:text-sm">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>
    </MotionConfig>
  );
}
