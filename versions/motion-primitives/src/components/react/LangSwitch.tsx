import { MotionConfig } from "motion/react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { cn } from "@/lib/utils";

export type LangItem = {
  code: string;
  label: string;
  ariaLabel: string;
  href: string;
  active: boolean;
};

type LangSwitchProps = {
  items: LangItem[];
  ariaLabel: string;
};

export function LangSwitch({ items, ariaLabel }: LangSwitchProps) {
  return (
    <nav aria-label={ariaLabel}>
      <MotionConfig reducedMotion="user">
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <AnimatedBackground
            enableHover
            className="bg-secondary"
            transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
          >
            {items.map((item) => (
              <a
                key={item.code}
                data-id={item.code}
                href={item.href}
                onClick={() => localStorage.setItem("lisible-locale", item.code)}
                lang={item.code}
                hrefLang={item.code}
                aria-label={item.ariaLabel}
                aria-current={item.active ? "true" : undefined}
                className={cn(
                  "inline-flex h-11 min-w-11 items-center justify-center px-2.5 text-xs font-semibold tracking-wide transition-colors",
                  item.active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
          </AnimatedBackground>
        </div>
      </MotionConfig>
    </nav>
  );
}
