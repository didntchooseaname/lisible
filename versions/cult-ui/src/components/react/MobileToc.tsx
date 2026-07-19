import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { SidePanel } from "@/components/ui/side-panel";
import { cn } from "@/lib/utils";

interface MobileTocItem {
  slug: string;
  text: string;
  depth: number;
}

interface MobileTocProps {
  items: MobileTocItem[];
  title: string;
  openLabel: string;
  closeLabel: string;
}

export function MobileToc({
  items,
  title,
  openLabel,
  closeLabel,
}: MobileTocProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <SidePanel
      panelOpen={panelOpen}
      handlePanelOpen={() => setPanelOpen((value) => !value)}
      className="w-full rounded-[16px] border border-border bg-card md:w-full"
      renderButton={(handleToggle) => (
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={panelOpen}
          aria-label={panelOpen ? closeLabel : openLabel}
          className="flex min-h-11 w-full items-center gap-2 py-1 pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <List size={18} aria-hidden="true" />
          <span>{title}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "ml-auto transition-transform duration-200",
              panelOpen && "rotate-180",
            )}
          />
        </button>
      )}
    >
      <nav aria-label={title} className="px-4 pb-4">
        <ul className="flex flex-col border-l border-border">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                onClick={() => setPanelOpen(false)}
                className={cn(
                  "-ml-px block min-h-9 border-l-2 border-transparent py-1.5 pr-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground",
                  item.depth === 2 ? "pl-4" : "pl-8",
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </SidePanel>
  );
}

export default MobileToc;
