"use client";
import { AnimatedTabs, type AnimatedTab } from "@/components/ui/tabs";

export interface TagTabPost {
  title: string;
  url: string;
  dateIso: string;
  dateLabel: string;
}

export interface TagTabData {
  slug: string;
  name: string;
  countLabel: string;
  tagUrl: string;
  allPostsLabel: string;
  posts: TagTabPost[];
}

export default function TagsTabs({
  tags,
  listLabel,
}: {
  tags: TagTabData[];
  listLabel: string;
}) {
  const tabs: AnimatedTab[] = tags.map((tag) => ({
    title: tag.name,
    value: tag.slug,
    content: (
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{tag.countLabel}</p>
        <ul className="mt-3 divide-y divide-border">
          {tag.posts.map((post) => (
            <li key={post.url}>
              <a
                href={post.url}
                className="group flex min-h-11 flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-medium transition-colors group-hover:text-accent">
                  {post.title}
                </span>
                <time
                  dateTime={post.dateIso}
                  className="shrink-0 text-sm text-muted-foreground"
                >
                  {post.dateLabel}
                </time>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={tag.tagUrl}
          className="mt-3 inline-flex min-h-11 items-center text-sm font-medium underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
        >
          {tag.allPostsLabel}
        </a>
      </div>
    ),
  }));

  return <AnimatedTabs tabs={tabs} listLabel={listLabel} />;
}
