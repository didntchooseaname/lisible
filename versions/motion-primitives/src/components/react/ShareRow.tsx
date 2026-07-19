import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { Magnetic } from "@/components/ui/magnetic";

type ShareLabels = {
  title: string;
  x: string;
  bluesky: string;
  linkedin: string;
  mastodon: string;
  copyLink: string;
  copied: string;
  mastodonPrompt: string;
};

type ShareRowProps = {
  url: string;
  title: string;
  labels: ShareLabels;
};

const MASTODON_KEY = "mastodon:instance";

function MagneticItem({ children }: { children: ReactNode }) {
  return (
    <Magnetic intensity={0.3} range={60} actionArea="self">
      {children}
    </Magnetic>
  );
}

const itemClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

export function ShareRow({ url, title, labels }: ShareRowProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);
  const encodedShare = encodeURIComponent(`${title} ${url}`);

  const xHref = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const blueskyHref = `https://bsky.app/intent/compose?text=${encodedShare}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  function shareOnMastodon() {
    let instance = "";
    try {
      instance = window.localStorage.getItem(MASTODON_KEY) ?? "";
    } catch {
      instance = "";
    }
    if (!instance) {
      const answer = window.prompt(labels.mastodonPrompt, "");
      if (!answer) return;
      instance = answer.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      if (!instance) return;
      try {
        window.localStorage.setItem(MASTODON_KEY, instance);
      } catch {
      }
    }
    window.open(`https://${instance}/share?text=${encodedShare}`, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-sm font-medium text-muted-foreground">{labels.title}</span>

        <MagneticItem>
          <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label={labels.x} className={itemClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
          </a>
        </MagneticItem>

        <MagneticItem>
          <a href={blueskyHref} target="_blank" rel="noopener noreferrer" aria-label={labels.bluesky} className={itemClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.038.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.018.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
            </svg>
          </a>
        </MagneticItem>

        <MagneticItem>
          <a href={linkedinHref} target="_blank" rel="noopener noreferrer" aria-label={labels.linkedin} className={itemClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
            </svg>
          </a>
        </MagneticItem>

        <MagneticItem>
          <button type="button" onClick={shareOnMastodon} aria-label={labels.mastodon} className={itemClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.007-.453-.067-2.169-.316-6.14-.316h-.03c-3.972 0-4.824.25-5.278.316C3.898.692 1.513 2.518.936 5.127.66 6.412.63 7.837.68 9.143c.072 1.874.086 3.745.258 5.611.119 1.24.327 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
            </svg>
          </button>
        </MagneticItem>

        <MagneticItem>
          <button type="button" onClick={copyLink} aria-label={copied ? labels.copied : labels.copyLink} aria-live="polite" className={itemClass}>
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>
        </MagneticItem>
      </div>
    </MotionConfig>
  );
}
