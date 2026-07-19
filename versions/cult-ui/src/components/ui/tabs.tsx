import { useId, useRef, useState, type ReactNode } from "react";
import { Children, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  label?: string;
  children: ReactNode;
}

export function Tabs({ tabs, label, children }: TabsProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const panels = Children.toArray(children).filter((child) =>
    isValidElement(child),
  );

  function focusTab(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    btnRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
    }
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-card">
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 border-b border-border bg-secondary/40 p-1"
      >
        {tabs.map((label, index) => {
          const selected = index === active;
          return (
            <button
              key={label}
              ref={(el) => {
                btnRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {panels.map((panel, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          className="px-4 py-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

export function Tab({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default Tabs;
