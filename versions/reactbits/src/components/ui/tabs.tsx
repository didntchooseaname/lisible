import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FEATURES } from "@/site.config";
import { ui, defaultLocale, type Locale } from "@/i18n/ui";


function currentLocale(): Locale {
  if (typeof document !== "undefined" && document.documentElement.lang === "en") {
    return "en";
  }
  return defaultLocale;
}

export function Tab({ children }: { children?: ReactNode }) {
  return (
    <div role="tabpanel" className="mdx-tabs__panel">
      {children}
    </div>
  );
}

interface TabsProps {
  tabs: string[];
  label?: string;
  children?: ReactNode;
}

export function Tabs({ tabs, label, children }: TabsProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const panelsRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const container = panelsRef.current;
    if (!container) return;
    const root = container.closest(".mdx-tabs");
    root?.setAttribute("data-hydrated", "");
    root
      ?.querySelector('[role="tablist"]')
      ?.setAttribute("aria-label", label ?? ui[currentLocale()].mdx.tabList);
    const panels = container.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    panels.forEach((panel, index) => {
      panel.hidden = index !== active;
      panel.id = `${baseId}-panel-${index}`;
      panel.setAttribute("aria-labelledby", `${baseId}-tab-${index}`);
      panel.setAttribute("tabindex", "0");
    });
  }, [active, baseId, label]);

  if (!FEATURES.mdxComponents) {
    return <div className="mdx-tabs mdx-tabs--plain">{children}</div>;
  }

  const focusTab = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    btnRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
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
  };

  return (
    <div className="mdx-tabs not-prose">
      <div role="tablist" aria-label={label} className="mdx-tabs__list">
        {tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            ref={(el) => {
              btnRefs.current[index] = el;
            }}
            className="mdx-tabs__tab"
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mdx-tabs__panels" ref={panelsRef}>
        {children}
      </div>
    </div>
  );
}
