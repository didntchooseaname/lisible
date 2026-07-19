'use client';
import { cn } from '@/lib/utils';
import { motion, useSpring, useTransform } from 'motion/react';
import type { SpringOptions } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  locale: string;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
};

export function AnimatedNumber({
  value,
  locale,
  className,
  springOptions,
  as = 'span',
}: AnimatedNumberProps) {
  const MotionComponent = motion.create(as as keyof JSX.IntrinsicElements);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    new Intl.NumberFormat(locale).format(Math.round(current))
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
