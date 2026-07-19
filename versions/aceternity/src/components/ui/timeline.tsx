"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setHeight(el.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full" ref={containerRef}>
      <div ref={ref} className="relative pb-10">
        {data.map((item) => (
          <section
            key={item.title}
            aria-label={item.title}
            className="flex justify-start pt-10 md:gap-10 md:pt-14"
          >
            <div className="sticky top-24 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-background"
                aria-hidden="true"
              >
                <div className="h-4 w-4 rounded-full border border-border bg-secondary p-2" />
              </div>
              <h2 className="hidden text-xl font-bold text-muted-foreground md:block md:pl-20 md:text-3xl">
                {item.title}
              </h2>
            </div>

            <div className="relative w-full pr-1 pl-20 md:pl-4">
              <h2 className="mb-4 block text-left text-2xl font-bold text-muted-foreground md:hidden">
                {item.title}
              </h2>
              {item.content}
            </div>
          </section>
        ))}
        <div
          style={{ height: height + "px" }}
          aria-hidden="true"
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-accent from-[0%] via-accent via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  );
};
