import { MotionConfig } from "motion/react";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import { cn } from "@/lib/utils";

export type TocItem = {
  slug: string;
  text: string;
  depth: number;
};

type MobileTocProps = {
  items: TocItem[];
  label: string;
};

export function MobileToc({ items, label }: MobileTocProps) {
  if (items.length === 0) return null;
  return (
    <MotionConfig reducedMotion="user">
      <Disclosure
        className="rounded-lg border border-border bg-card"
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <DisclosureTrigger>
          <button
            type="button"
            className="group flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm font-semibold"
          >
            {label}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
        </DisclosureTrigger>
        <DisclosureContent>
          <ul className="flex flex-col gap-0.5 px-4 pb-3">
            {items.map((item) => (
              <li key={item.slug}>
                <a
                  href={`#${item.slug}`}
                  className={cn(
                    "block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    item.depth === 3 && "pl-4",
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </DisclosureContent>
      </Disclosure>
    </MotionConfig>
  );
}
