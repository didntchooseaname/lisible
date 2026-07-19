import {
  MinimalCard,
  MinimalCardDescription,
  MinimalCardTitle,
} from "@/components/ui/minimal-card";

interface PostCardMinimalProps {
  href: string;
  title: string;
  description: string;
  dateISO: string;
  dateLabel: string;
  readingTimeLabel: string;
  draftLabel?: string | null;
  coverSrc?: string | null;
  coverAlt?: string;
  headingLevel?: "h2" | "h3";
}

export function PostCardMinimal({
  href,
  title,
  description,
  dateISO,
  dateLabel,
  readingTimeLabel,
  draftLabel,
  coverSrc,
  coverAlt = "",
  headingLevel = "h3",
}: PostCardMinimalProps) {
  return (
    <article className="h-full">
      <MinimalCard className="group relative flex h-full flex-col bg-card p-5 transition-colors hover:bg-card hover:shadow-[0_0_0_1px_var(--color-accent)] dark:bg-card dark:hover:bg-card">
        {coverSrc ? (
          <div className="cover-frame card-cover">
            <img
              src={coverSrc}
              alt={coverAlt}
              width={800}
              height={400}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <MinimalCardTitle
          as={headingLevel}
          className="mt-0 px-0 text-lg leading-snug tracking-tight text-card-foreground"
        >
          <a
            href={href}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {title}
          </a>
          {draftLabel ? (
            <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 align-middle text-xs font-medium text-muted-foreground">
              {draftLabel}
            </span>
          ) : null}
        </MinimalCardTitle>
        <MinimalCardDescription className="mt-2 px-0 pb-0 text-sm leading-relaxed text-muted-foreground">
          {description}
        </MinimalCardDescription>
        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-4 text-xs text-muted-foreground">
          <time dateTime={dateISO}>{dateLabel}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{readingTimeLabel}</span>
        </p>
      </MinimalCard>
    </article>
  );
}

export default PostCardMinimal;
