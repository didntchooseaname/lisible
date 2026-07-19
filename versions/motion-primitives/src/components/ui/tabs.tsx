import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function Tab({ children }: { children?: ReactNode }) {
  return (
    <div className="mdx-tab-panel" data-tab-panel role="tabpanel" tabIndex={0}>
      {children}
    </div>
  );
}

type TabsProps = {
  tabs: string[];
  label?: string;
  children?: ReactNode;
};

export function Tabs({ tabs, label, children }: TabsProps) {
  const [active, setActive] = useState(0);
  const panelsRef = useRef<HTMLDivElement>(null);
  const baseId = useId().replace(/[:]/g, "");

  useEffect(() => {
    const container = panelsRef.current;
    if (!container) return;
    const panels = container.querySelectorAll<HTMLElement>("[data-tab-panel]");
    container.setAttribute("data-ready", "");
    panels.forEach((panel, i) => {
      panel.hidden = i !== active;
      panel.id = `${baseId}-panel-${i}`;
      panel.setAttribute("aria-labelledby", `${baseId}-tab-${i}`);
    });
  }, [active, baseId]);

  const focusTab = (index: number) => {
    setActive(index);
    requestAnimationFrame(() => {
      document.getElementById(`${baseId}-tab-${index}`)?.focus();
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusTab((active + 1) % tabs.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab((active - 1 + tabs.length) % tabs.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div className="mdx-tabs">
      <div role="tablist" aria-label={label} className="mdx-tablist">
        {tabs.map((tabLabel, i) => (
          <button
            key={tabLabel}
            id={`${baseId}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={cn("mdx-tab", i === active && "is-active")}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {tabLabel}
          </button>
        ))}
      </div>
      <div ref={panelsRef} className="mdx-tabpanels">
        {children}
      </div>
    </div>
  );
}
