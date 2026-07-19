"use client";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";

export interface TimelinePost {
  title: string;
  url: string;
  description: string;
  dateIso: string;
  dateLabel: string;
  readingLabel: string;
  draftLabel?: string;
}

export interface TimelineYear {
  year: string;
  posts: TimelinePost[];
}

export default function BlogTimeline({ years }: { years: TimelineYear[] }) {
  const data: TimelineEntry[] = years.map((group) => ({
    title: group.year,
    content: (
      <ul className="flex flex-col gap-3">
        {group.posts.map((post) => (
          <li key={post.url}>
            <a
              href={post.url}
              className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent"
            >
              <span className="font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                {post.title}
                {post.draftLabel && (
                  <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
                    {post.draftLabel}
                  </span>
                )}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {post.description}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <time dateTime={post.dateIso}>{post.dateLabel}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readingLabel}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    ),
  }));

  return <Timeline data={data} />;
}
