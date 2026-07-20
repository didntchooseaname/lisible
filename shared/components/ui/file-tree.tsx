import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export interface TreeViewElement {
  id: string;
  name: string;
  type?: "file" | "folder";
  isSelectable?: boolean;
  children?: TreeViewElement[];
}

type TreeSortMode = "default" | "none" | ((a: TreeViewElement, b: TreeViewElement) => number);

interface TreeProps {
  elements?: TreeViewElement[];
  initialExpandedItems?: string[];
  initialSelectedId?: string;
  indicator?: boolean;
  sort?: TreeSortMode;
  className?: string;
  dir?: "ltr" | "rtl";
  children?: ReactNode;
}

const iconStyle: CSSProperties = {
  width: "1rem",
  height: "1rem",
  flex: "0 0 auto",
};

function TreeIcon({ type, open = false }: { type: "chevron" | "folder" | "file" | "expand"; open?: boolean }) {
  if (type === "chevron") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ ...iconStyle, transform: open ? "rotate(90deg)" : "none", transition: "transform 200ms ease" }}
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }
  if (type === "folder") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={iconStyle}
      >
        <path d="M3 7.5V5.8A1.8 1.8 0 0 1 4.8 4h4l2 2h8.4A1.8 1.8 0 0 1 21 7.8v1.1" />
        {open
          ? <path d="M3.4 9h17.2l-2.2 9.2A2.3 2.3 0 0 1 16.2 20H5.8a2.3 2.3 0 0 1-2.2-1.8L2 11.3A1.9 1.9 0 0 1 3.4 9Z" />
          : <path d="M3 8h18v9.8a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8Z" />}
      </svg>
    );
  }
  if (type === "file") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={iconStyle}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle}
    >
      {open ? (
        <>
          <path d="m7 15 5-5 5 5" />
          <path d="m7 9 5 5 5-5" />
        </>
      ) : (
        <>
          <path d="m7 6 5 5 5-5" />
          <path d="m7 18 5-5 5 5" />
        </>
      )}
    </svg>
  );
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function isFolder(item: TreeViewElement): boolean {
  return item.type === "folder" || Array.isArray(item.children);
}

function sortElements(elements: TreeViewElement[], sort: TreeSortMode): TreeViewElement[] {
  const nested = elements.map((item) => ({
    ...item,
    children: item.children ? sortElements(item.children, sort) : undefined,
  }));
  if (sort === "none") return nested;
  const comparator = typeof sort === "function"
    ? sort
    : (a: TreeViewElement, b: TreeViewElement) => {
        if (isFolder(a) !== isFolder(b)) return isFolder(a) ? -1 : 1;
        return collator.compare(a.name, b.name);
      };
  return nested.sort(comparator);
}

function folderIds(elements: TreeViewElement[]): string[] {
  return elements.flatMap((item) => [
    ...(isFolder(item) ? [item.id] : []),
    ...folderIds(item.children ?? []),
  ]);
}

function Branch({
  item,
  depth,
  expanded,
  selectedId,
  indicator,
  onExpand,
  onSelect,
}: {
  item: TreeViewElement;
  depth: number;
  expanded: Set<string>;
  selectedId?: string;
  indicator: boolean;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const folder = isFolder(item);
  const open = folder && expanded.has(item.id);
  const selected = selectedId === item.id;
  const selectable = item.isSelectable ?? true;
  const indent = `calc(${depth} * 1.35rem + 0.55rem)`;

  return (
    <li
      role="treeitem"
      aria-expanded={folder ? open : undefined}
      aria-selected={selectable ? selected : undefined}
      className="m-0 list-none p-0"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      <div className="group/file-tree relative flex min-w-max items-center">
        {indicator && depth > 0 && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 border-l border-border/70 transition-colors group-hover/file-tree:border-accent/50"
            style={{ left: `calc(${depth - 1} * 1.35rem + 1.05rem)` }}
          />
        )}
        <button
          type="button"
          disabled={!selectable}
          onClick={() => {
            if (folder) onExpand(item.id);
            if (selectable) onSelect(item.id);
          }}
          className="my-0.5 flex min-h-9 w-full min-w-max items-center gap-2 rounded-xl py-1.5 pr-4 text-left font-mono text-[0.82rem] leading-5 transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-default disabled:opacity-60"
          style={{
            paddingInlineStart: indent,
            color: selected ? "var(--accent)" : "inherit",
            background: selected ? "color-mix(in oklab, var(--accent) 12%, transparent)" : undefined,
          }}
        >
          {folder ? (
            <span className="text-muted-foreground"><TreeIcon type="chevron" open={open} /></span>
          ) : (
            <span aria-hidden="true" style={{ width: "1rem", flex: "0 0 auto" }} />
          )}
          <span aria-hidden="true" className="text-accent">
            <TreeIcon type={folder ? "folder" : "file"} open={open} />
          </span>
          <span>{item.name}</span>
        </button>
      </div>
      {folder && open && item.children && (
        <ul role="group" className="m-0 list-none p-0" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {item.children.map((child) => (
            <Branch
              key={child.id}
              item={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              indicator={indicator}
              onExpand={onExpand}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function Tree({
  elements = [],
  initialExpandedItems = [],
  initialSelectedId,
  indicator = true,
  sort = "default",
  className = "",
  dir = "ltr",
  children,
}: TreeProps) {
  const sorted = useMemo(() => sortElements(elements, sort), [elements, sort]);
  const allFolders = useMemo(() => folderIds(sorted), [sorted]);
  const [expandedItems, setExpandedItems] = useState<string[]>(initialExpandedItems);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [language, setLanguage] = useState<"fr" | "en">("en");
  const expanded = useMemo(() => new Set(expandedItems), [expandedItems]);
  const allOpen = allFolders.length > 0 && allFolders.every((id) => expanded.has(id));
  const labels = language === "fr"
    ? { title: "Arborescence", tree: "Structure de fichiers", expand: "Tout ouvrir", collapse: "Tout fermer" }
    : { title: "File tree", tree: "File structure", expand: "Expand all", collapse: "Collapse all" };

  useEffect(() => {
    setLanguage(document.documentElement.lang === "fr" ? "fr" : "en");
  }, []);

  const onExpand = (id: string) => {
    setExpandedItems((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  return (
    <div
      dir={dir}
      className={`not-prose my-6 overflow-hidden border border-border bg-card/80 shadow-sm ${className}`}
      style={{
        borderRadius: "1.7rem 1.1rem 1.6rem 1.2rem / 1.15rem 1.7rem 1.1rem 1.6rem",
        backgroundImage: "radial-gradient(circle at 12% 0%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 38%)",
      }}
      data-file-tree
    >
      {elements.length > 0 && (
        <div className="flex items-center justify-between border-b border-border/75 px-4 py-2.5">
          <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {labels.title}
          </span>
          <button
            type="button"
            onClick={() => setExpandedItems(allOpen ? [] : allFolders)}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[0.7rem] font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            aria-label={allOpen ? labels.collapse : labels.expand}
          >
            <TreeIcon type="expand" open={allOpen} />
            <span>{allOpen ? labels.collapse : labels.expand}</span>
          </button>
        </div>
      )}
      <div className="overflow-x-auto p-3 sm:p-4">
        {elements.length > 0 ? (
          <ul
            role="tree"
            aria-label={labels.tree}
            className="m-0 min-w-max list-none p-0"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {sorted.map((item) => (
              <Branch
                key={item.id}
                item={item}
                depth={0}
                expanded={expanded}
                selectedId={selectedId}
                indicator={indicator}
                onExpand={onExpand}
                onSelect={setSelectedId}
              />
            ))}
          </ul>
        ) : children}
      </div>
    </div>
  );
}

function Folder({
  name,
  element,
  children,
}: {
  name?: string;
  element?: string;
  children?: ReactNode;
}) {
  const count = Children.count(children);
  return (
    <div className="my-1 font-mono text-sm">
      <span className="inline-flex items-center gap-2 font-semibold text-accent">
        <TreeIcon type="folder" open />
        {element ?? name}
      </span>
      {count > 0 && <div className="ml-3 border-l border-border pl-4">{children}</div>}
    </div>
  );
}

function File({ name, children }: { name?: string; children?: ReactNode }) {
  return (
    <div className="my-1 inline-flex items-center gap-2 font-mono text-sm">
      <span className="text-accent"><TreeIcon type="file" /></span>
      {name ?? (isValidElement(children) ? children : <span>{children}</span>)}
    </div>
  );
}

export { File, Folder, Tree };
export type { TreeProps, TreeSortMode };
