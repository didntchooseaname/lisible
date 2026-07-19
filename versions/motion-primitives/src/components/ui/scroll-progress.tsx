'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import type { SpringOptions } from 'motion/react';
import { cn } from '@/lib/utils';
import type { RefObject } from 'react';

export type ScrollProgressProps = {
  className?: string;
  springOptions?: SpringOptions;
  containerRef?: RefObject<HTMLDivElement>;
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 200,
  damping: 50,
  restDelta: 0.001,
};

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll({
    container: containerRef,
    layoutEffect: Boolean(containerRef?.current),
  });

  const smooth = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING_OPTIONS,
    ...(springOptions ?? {}),
  });

  const prefersReducedMotion = useReducedMotion();
  const scaleX = prefersReducedMotion ? scrollYProgress : smooth;

  return (
    <motion.div
      className={cn('inset-x-0 top-0 h-1 origin-left', className)}
      style={{
        scaleX,
      }}
    />
  );
}
