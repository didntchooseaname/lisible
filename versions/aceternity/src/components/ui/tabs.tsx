"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";


export function Tab({ children }: { children?: React.ReactNode }) {
  return (
    <div data-tab-panel role="tabpanel" tabIndex={0} className="mdx-tabs__panel">
      {children}
    </div>
  );
}

export function Tabs({
  tabs,
  label,
  listLabel,
  children,
}: {
  tabs: string[];
  label?: string;
  listLabel?: string;
  children?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const panelsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panels = panelsRef.current?.querySelectorAll<HTMLElement>("[data-tab-panel]");
    if (!panels) return;
    panels.forEach((panel, i) => {
      panel.id = `${baseId}-panel-${i}`;
      panel.setAttribute("aria-labelledby", `${baseId}-tab-${i}`);
      panel.classList.toggle("is-active", i === active);
      panel.hidden = i !== active;
    });
    panelsRef.current?.setAttribute("data-ready", "");
  }, [active, baseId]);

  const onKeyDown = (event: React.KeyboardEvent, idx: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (idx + delta + tabs.length) % tabs.length;
    setActive(next);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>("[role='tab']")
      [next]?.focus();
  };

  return (
    <div className="mdx-tabs">
      <div ref={listRef} role="tablist" aria-label={label ?? listLabel} className="mdx-tabs__list not-prose">
        {tabs.map((title, i) => (
          <button
            key={title}
            type="button"
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(event) => onKeyDown(event, i)}
            className={cn("mdx-tabs__tab", active === i && "is-active")}
          >
            {active === i && (
              <motion.span
                layoutId={`${baseId}-pill`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className="mdx-tabs__pill"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{title}</span>
          </button>
        ))}
      </div>
      <div ref={panelsRef} className="mdx-tabs__panels">
        {children}
      </div>
    </div>
  );
}


export type AnimatedTab = {
  title: string;
  value: string;
  content?: React.ReactNode;
};

export const AnimatedTabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
  listLabel,
}: {
  tabs: AnimatedTab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
  listLabel?: string;
}) => {
  const [active, setActive] = useState<AnimatedTab>(propTabs[0]);
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const activate = (tab: AnimatedTab) => setActive(tab);

  const onKeyDown = (event: React.KeyboardEvent, idx: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (idx + delta + propTabs.length) % propTabs.length;
    activate(propTabs[next]);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']");
    buttons?.[next]?.focus();
  };

  return (
    <>
      <div
        ref={listRef}
        role="tablist"
        aria-label={listLabel}
        className={cn(
          "no-visible-scrollbar relative flex w-full max-w-full flex-row flex-wrap items-center justify-start gap-1 [perspective:1000px]",
          containerClassName,
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.value}`}
            aria-selected={active.value === tab.value}
            aria-controls={`${baseId}-panel-${tab.value}`}
            tabIndex={active.value === tab.value ? 0 : -1}
            onClick={() => activate(tab)}
            onKeyDown={(event) => onKeyDown(event, idx)}
            className={cn(
              "relative min-h-11 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active.value === tab.value && "text-foreground",
              tabClassName,
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {active.value === tab.value && (
              <motion.span
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 rounded-full bg-secondary",
                  activeTabClassName,
                )}
              />
            )}
            <span className="relative z-10 block">{tab.title}</span>
          </button>
        ))}
      </div>
      <motion.div
        key={active.value}
        role="tabpanel"
        id={`${baseId}-panel-${active.value}`}
        aria-labelledby={`${baseId}-tab-${active.value}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn("mt-6 w-full", contentClassName)}
      >
        {active.content}
      </motion.div>
    </>
  );
};
