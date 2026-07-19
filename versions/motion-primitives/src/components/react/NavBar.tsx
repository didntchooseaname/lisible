import { MotionConfig } from "motion/react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  active: boolean;
};

type NavBarProps = {
  items: NavItem[];
  ariaLabel: string;
};

export function NavBar({ items, ariaLabel }: NavBarProps) {
  return (
    <nav aria-label={ariaLabel}>
      <MotionConfig reducedMotion="user">
        <div className="flex items-center gap-1">
          <AnimatedBackground
            enableHover
            className="rounded-md bg-secondary"
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            {items.map((item) => (
              <a
                key={item.href}
                data-id={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  item.active &&
                    "text-foreground after:absolute after:inset-x-3 after:bottom-1 after:z-20 after:h-0.5 after:rounded-full after:bg-accent",
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
