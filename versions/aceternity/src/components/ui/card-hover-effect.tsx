"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
  headingLevel = "h3",
}: {
  items: {
    title: string;
    description: string;
    link: string;
    meta?: string;
  }[];
  className?: string;
  headingLevel?: "h2" | "h3";
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 gap-1 py-4 sm:grid-cols-2", className)}>
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-xl bg-secondary"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle as={headingLevel}>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            {item.meta && (
              <p className="mt-4 text-xs text-muted-foreground">{item.meta}</p>
            )}
          </Card>
        </a>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative z-20 h-full w-full overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors group-hover:border-accent",
        className,
      )}
    >
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
  as: Tag = "h3",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "h2" | "h3";
}) => {
  return (
    <Tag
      className={cn(
        "text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent",
        className,
      )}
    >
      {children}
    </Tag>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-2 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
};
