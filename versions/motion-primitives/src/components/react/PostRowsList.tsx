import { MotionConfig } from "motion/react";
import { AnimatedGroup } from "@/components/ui/animated-group";

export type PostRowData = {
  url: string;
  title: string;
  description: string;
  readingLabel: string;
  tags: { label: string; url: string }[];
  dateISO: string;
  dateLabel: string;
  draftLabel?: string;
};

type PostRowsListProps = {
  posts: PostRowData[];
};

export function PostRowsList({ posts }: PostRowsListProps) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatedGroup as="ul" asChild="li" preset="slide" className="divide-y divide-border">
        {posts.map((post) => (
          <div key={post.url} className="py-1">
            <a
              href={post.url}
              className="group flex min-h-11 flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="font-medium transition-colors group-hover:text-accent">
                {post.title}
                {post.draftLabel && (
                  <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
                    {post.draftLabel}
                  </span>
                )}
              </span>
              <time dateTime={post.dateISO} className="shrink-0 text-sm text-muted-foreground">
                {post.dateLabel}
              </time>
            </a>
            {/* Scent of information: a bare title and date give nothing to scan. */}
            <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 pb-3.5 text-xs text-muted-foreground">
              <span>{post.readingLabel}</span>
              {post.tags.length > 0 && (
                <span className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <a
                      key={tag.url}
                      href={tag.url}
                      className="rounded-md border border-border px-1.5 py-0.5 transition-colors hover:border-accent hover:text-accent"
                    >
                      {tag.label}
                    </a>
                  ))}
                </span>
              )}
            </p>
          </div>
        ))}
      </AnimatedGroup>
    </MotionConfig>
  );
}
