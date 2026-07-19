import * as React from "react";
import { cn } from "@/lib/utils";

type TabsProps = {
  tabs: string[];
  label?: string;
  defaultTab?: string;
  className?: string;
  children: React.ReactNode;
};

function Tabs({ tabs, label, defaultTab, className, children }: TabsProps) {
  const [active, setActive] = React.useState(
    defaultTab ? Math.max(tabs.indexOf(defaultTab), 0) : 0,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const panels = container.querySelectorAll<HTMLElement>("[data-tab-panel]");
    panels.forEach((panel, i) => panel.toggleAttribute("hidden", i !== active));
  }, [active, children]);

  if (!__MDX_COMPONENTS_ENABLED__) {
    return <div className={cn("my-6", className)}>{children}</div>;
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (active - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div className={cn("mdx-tabs my-6", className)}>
      <div className="mdx-tabs-list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab}-${i}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn("mdx-tab", active === i && "is-active")}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mdx-tabs-panels" ref={containerRef}>
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
    <div data-tab-panel="" role="tabpanel" className={cn("mdx-tab-panel", className)}>
      {children}
    </div>
  );
}

export { Tabs, Tab };
