import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Magnetic } from "@/components/ui/magnetic";

type FooterSocialProps = {
  githubHref?: string;
  githubLabel: string;
  rssHref: string;
  rssLabel: string;
};

function MaybeMagnetic({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <Magnetic intensity={0.35} range={70} actionArea="self">
      {children}
    </Magnetic>
  );
}

export function FooterSocial({
  githubHref,
  githubLabel,
  rssHref,
  rssLabel,
}: FooterSocialProps) {
  return (
    <div className="flex items-center gap-1">
      {githubHref ? (
        <MaybeMagnetic>
          <a
            href={githubHref}
            aria-label={githubLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
          </a>
        </MaybeMagnetic>
      ) : null}
      <MaybeMagnetic>
        <a
          href={rssHref}
          aria-label={rssLabel}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 11a9 9 0 0 1 9 9"></path>
            <path d="M4 4a16 16 0 0 1 16 16"></path>
            <circle cx="5" cy="19" r="1"></circle>
          </svg>
        </a>
      </MaybeMagnetic>
    </div>
  );
}
