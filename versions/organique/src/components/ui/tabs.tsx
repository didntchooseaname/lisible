import * as React from "react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/features";

type TabsProps = {
  tabs: string[];
  label?: string;
  defaultTab?: string;
  className?: string;
  children: React.ReactNode;
};

function Tabs({ tabs, label, defaultTab, className, children }: TabsProps) {
  if (!FEATURES.mdxComponents) {
    return <div className={cn("my-6", className)}>{children}</div>;
  }

  const [active, setActive] = React.useState(
    defaultTab ? Math.max(tabs.indexOf(defaultTab), 0) : 0,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const panels = container.querySelectorAll<HTMLElement>("[data-tab-panel]");
    panels.forEach((panel, i) => {
      panel.toggleAttribute("hidden", i !== active);
    });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = active;
    if (e.key === "ArrowRight") next = (active + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={cn("mdx-tabs my-6", className)}>
      <div className="mdx-tablist" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn("mdx-tab", active === i && "is-active")}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mdx-tabpanels" ref={containerRef}>
        {children}
      </div>
    </div>
  );
}

type TabProps = {
  className?: string;
  children: React.ReactNode;
};

function Tab({ className, children }: TabProps) {
  return (
    <div data-tab-panel="" role="tabpanel" className={cn("mdx-tabpanel", className)}>
      {children}
    </div>
  );
}

export { Tabs, Tab };
