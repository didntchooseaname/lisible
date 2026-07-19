import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { TextMorph } from "@/components/ui/text-morph";

type CopyLinkButtonProps = {
  copyLabel: string;
  copiedLabel: string;
};

export function CopyLinkButton({ copyLabel, copiedLabel }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0] ?? window.location.href);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        onClick={handleClick}
        aria-live="polite"
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <TextMorph as="span" className="leading-none">
          {copied ? copiedLabel : copyLabel}
        </TextMorph>
      </button>
    </MotionConfig>
  );
}
