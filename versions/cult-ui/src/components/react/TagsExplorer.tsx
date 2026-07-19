import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs";

export interface TagsExplorerTag {
  slug: string;
  name: string;
  countLabel: string;
  href: string;
}

export interface TagsExplorerTopTag {
  slug: string;
  name: string;
  href: string;
  posts: { title: string; href: string; dateISO: string; dateLabel: string }[];
}

interface TagsExplorerProps {
  allLabel: string;
  allTags: TagsExplorerTag[];
  topTags: TagsExplorerTopTag[];
}

export function TagsExplorer({
  allLabel,
  allTags,
  topTags,
}: TagsExplorerProps) {
  const tabs = [
    {
      id: 0,
      label: allLabel,
      content: (
        <ul className="flex flex-wrap gap-3 p-4" aria-label={allLabel}>
          {allTags.map((tag) => (
            <li key={tag.slug}>
              <a
                href={tag.href}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                <span aria-hidden="true" className="text-accent">
                  #
                </span>
                {tag.name}
                <span className="text-muted-foreground">{tag.countLabel}</span>
              </a>
            </li>
          ))}
        </ul>
      ),
    },
    ...topTags.map((tag, index) => ({
      id: index + 1,
      label: `#${tag.name}`,
      content: (
        <ul className="flex flex-col divide-y divide-border p-4">
          {tag.posts.map((post) => (
            <li key={post.href}>
              <a
                href={post.href}
                className="group flex min-h-11 flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-medium text-foreground transition-colors group-hover:text-accent">
                  {post.title}
                </span>
                <time
                  dateTime={post.dateISO}
                  className="shrink-0 text-sm text-muted-foreground"
                >
                  {post.dateLabel}
                </time>
              </a>
            </li>
          ))}
        </ul>
      ),
    })),
  ];

  return (
    <DirectionAwareTabs
      tabs={tabs}
      className="bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"
    />
  );
}

export default TagsExplorer;
