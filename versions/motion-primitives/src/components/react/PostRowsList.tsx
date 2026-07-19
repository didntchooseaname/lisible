import { MotionConfig } from "motion/react";
import { AnimatedGroup } from "@/components/ui/animated-group";

export type PostRowData = {
  url: string;
  title: string;
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
          <a
            key={post.url}
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
            <time
              dateTime={post.dateISO}
              className="shrink-0 text-sm text-muted-foreground"
            >
              {post.dateLabel}
            </time>
          </a>
        ))}
      </AnimatedGroup>
    </MotionConfig>
  );
}
