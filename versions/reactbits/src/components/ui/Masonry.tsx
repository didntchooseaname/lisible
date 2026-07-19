import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/lib/kit';

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () =>
    typeof window === 'undefined'
      ? defaultValue
      : (values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue);

  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

export interface MasonryItem {
  id: string;
  url: string;
  title: string;
  description: string;
  meta: string;
  height: number;
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
}

const CardInner: React.FC<{ item: MasonryItem }> = ({ item }) => (
  <a
    href={item.url}
    className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card p-5 no-underline transition-colors hover:border-accent"
  >
    <h2 className="text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-accent">
      {item.title}
    </h2>
    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
    <p className="mt-auto pt-3 text-xs text-muted-foreground">{item.meta}</p>
  </a>
);

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.97,
  blurToFocus = true
}) => {
  const columns = useMedia(['(min-width:1000px)', '(min-width:640px)'], [3, 2], 1);

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  const [grid, containerHeight] = useMemo<[GridItem[], number]>(() => {
    if (!width) return [[], 0];
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const computed = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      const height = child.height;
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
    return [computed, Math.max(...colHeights, 0)];
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!width) return;
    const reduce = prefersReducedMotion();

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        if (reduce) {
          gsap.set(selector, { opacity: 1, ...animProps });
          return;
        }
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration: reduce ? 0 : duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
  }, [grid, width, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (id: string) => {
    if (scaleOnHover && !prefersReducedMotion()) {
      gsap.to(`[data-key="${id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = (id: string) => {
    if (scaleOnHover && !prefersReducedMotion()) {
      gsap.to(`[data-key="${id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  };

  if (typeof window === 'undefined' || !width) {
    return (
      <div ref={containerRef} className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} style={{ minHeight: item.height }}>
            <CardInner item={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: containerHeight }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="absolute top-0 left-0 opacity-0"
          style={{ willChange: 'transform, width, height, opacity' }}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
        >
          <CardInner item={item} />
        </div>
      ))}
    </div>
  );
};

export default Masonry;
