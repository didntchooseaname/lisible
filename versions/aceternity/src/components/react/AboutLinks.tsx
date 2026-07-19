"use client";
import { LinkPreview } from "@/components/ui/link-preview";

export default function AboutLinks({
  githubHref,
  githubLabel,
  githubPreviewSrc,
  githubPreviewAlt,
  rssHref,
  rssLabel,
}: {
  githubHref: string;
  githubLabel: string;
  githubPreviewSrc: string;
  githubPreviewAlt: string;
  rssHref: string;
  rssLabel: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2">
      { }
      {githubHref && (
        <>
          <LinkPreview
            url={githubHref}
            isStatic
            imageSrc={githubPreviewSrc}
            alt={githubPreviewAlt}
            className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-accent decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-accent"
          >
            {githubLabel}
          </LinkPreview>
          <span aria-hidden="true" className="text-muted-foreground">
            &middot;
          </span>
        </>
      )}
      <a
        href={rssHref}
        className="inline-flex min-h-11 items-center font-medium text-foreground underline decoration-accent decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-accent"
      >
        {rssLabel}
      </a>
    </p>
  );
}
