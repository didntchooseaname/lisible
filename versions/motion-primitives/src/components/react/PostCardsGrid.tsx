import { MotionConfig } from "motion/react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Spotlight } from "@/components/ui/spotlight";

export type PostCardData = {
  url: string;
  title: string;
  description: string;
  dateISO: string;
  dateLabel: string;
  readingLabel: string;
  draftLabel?: string;
  coverUrl?: string;
  coverAlt?: string;
};

type PostCardsGridProps = {
  posts: PostCardData[];
};

export function PostCardsGrid({ posts }: PostCardsGridProps) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatedGroup
        preset="blur-slide"
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        {posts.map((post) => (
          <article
            key={post.url}
            className="group relative flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent"
          >
            <Spotlight
              className="from-accent/25 via-accent/10 to-transparent blur-2xl"
              size={220}
            />
            {post.coverUrl && (
              <div className="cover mb-4 -mx-1 -mt-1">
                <img
                  src={post.coverUrl}
                  alt={post.coverAlt ?? ""}
                  className="cover-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold leading-snug tracking-tight">
              <a
                href={post.url}
                className="after:absolute after:inset-0 group-hover:text-accent"
              >
                {post.title}
              </a>
              {post.draftLabel && (
                <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
                  {post.draftLabel}
                </span>
              )}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <time dateTime={post.dateISO}>{post.dateLabel}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingLabel}</span>
            </p>
          </article>
        ))}
      </AnimatedGroup>
    </MotionConfig>
  );
}
