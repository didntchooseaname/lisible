import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FEATURES } from "@/site.config";

export function Tab({ children }: { children?: ReactNode }) {
  if (!FEATURES.mdxComponents) return <div>{children}</div>;
  return (
    <div data-tab-panel className="tab-panel" tabIndex={0}>
      {children}
    </div>
  );
}

export function Tabs({ tabs, label, children }: { tabs: string[]; label?: string; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const groupId = useId().replace(/[^a-zA-Z0-9-]/g, "");

  useEffect(() => {
    if (!FEATURES.mdxComponents) return;
    const panels = panelsRef.current?.querySelectorAll<HTMLElement>("[data-tab-panel]");
    if (!panels) return;
    panels.forEach((panel, index) => {
      panel.id = `${groupId}-panel-${index}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", `${groupId}-tab-${index}`);
      panel.hidden = index !== active;
    });
    setReady(true);
  }, [active, groupId]);

  if (!FEATURES.mdxComponents) return <div>{children}</div>;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={`tabs not-prose${ready ? " is-ready" : ""}`}>
      <div className="tabs-list" role="tablist" aria-label={label}>
        {tabs.map((label, index) => (
          <button
            key={label}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${groupId}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${groupId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            className="tabs-tab"
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tabs-panels" ref={panelsRef}>
        {children}
      </div>
    </div>
  );
}
