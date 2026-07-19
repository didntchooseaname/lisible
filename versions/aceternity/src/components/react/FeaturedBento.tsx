import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { GridDotBackground } from "@/components/ui/grid-dot-background";

export interface FeaturedPost {
  title: string;
  description: string;
  url: string;
  dateIso: string;
  dateLabel: string;
  readingLabel: string;
  draftLabel?: string;
  coverSrc?: string;
  coverAlt?: string;
}

export default function FeaturedBento({ posts }: { posts: FeaturedPost[] }) {
  return (
    <BentoGrid className="md:auto-rows-[13rem]">
      {posts.map((post, idx) => (
        <BentoGridItem
          key={post.url}
          href={post.url}
          className={idx === 0 ? "md:col-span-2" : ""}
          header={
            <div className="relative min-h-16 flex-1 overflow-hidden rounded-md border border-border/60 bg-secondary/30">
              {post.coverSrc ? (
                <img
                  src={post.coverSrc}
                  alt={post.coverAlt ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <GridDotBackground
                  variant={idx === 0 ? "grid" : "dots"}
                  withFade={false}
                  className="opacity-70"
                />
              )}
            </div>
          }
          title={
            <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors group-hover/bento:text-accent">
              {post.title}
              {post.draftLabel && (
                <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
                  {post.draftLabel}
                </span>
              )}
            </h3>
          }
          description={
            <>
              <span className="block">{post.description}</span>
              <span className="mt-2 flex flex-wrap items-center gap-x-2 text-xs">
                <time dateTime={post.dateIso}>{post.dateLabel}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readingLabel}</span>
              </span>
            </>
          }
        />
      ))}
    </BentoGrid>
  );
}
