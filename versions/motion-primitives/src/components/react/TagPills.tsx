import { MotionConfig } from "motion/react";
import { AnimatedBackground } from "@/components/ui/animated-background";

export type TagPill = {
  href: string;
  name: string;
  count: number;
};

type TagPillsProps = {
  tags: TagPill[];
  ariaLabel: string;
};

export function TagPills({ tags, ariaLabel }: TagPillsProps) {
  return (
    <MotionConfig reducedMotion="user">
      {/* biome-ignore lint/a11y/useSemanticElements: AnimatedBackground needs the anchors as direct children, list semantics come from roles */}
      <div aria-label={ariaLabel} role="list" className="flex flex-wrap gap-3">
        <AnimatedBackground
          enableHover
          className="rounded-md bg-secondary"
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
        >
          {tags.map((tag) => (
            // biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: pills read as list items, the href keeps them usable as links
            // biome-ignore lint/a11y/useSemanticElements: AnimatedBackground needs the anchors as direct children, list semantics come from roles
            <a
              key={tag.href}
              data-id={tag.href}
              href={tag.href}
              role="listitem"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              {tag.name}
              <span className="text-xs text-muted-foreground">{tag.count}</span>
            </a>
          ))}
        </AnimatedBackground>
      </div>
    </MotionConfig>
  );
}
