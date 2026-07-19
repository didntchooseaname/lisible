import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { SparklesIcon } from "lucide-react";
import useClickOutside from "@/hooks/useClickOutside";

type AiLabels = {
  trigger: string;
  copyMarkdown: string;
  copied: string;
  openClaude: string;
  openChatgpt: string;
};

type AiActionsProps = {
  url: string;
  markdown: string;
  prompt: string;
  labels: AiLabels;
};

const itemClass =
  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:bg-secondary";

export function AiActions({ url, markdown, prompt, labels }: AiActionsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef as RefObject<HTMLDivElement>, close);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const encodedPrompt = encodeURIComponent(prompt);
  const claudeHref = `https://claude.ai/new?q=${encodedPrompt}`;
  const chatgptHref = `https://chatgpt.com/?q=${encodedPrompt}`;

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
        >
          <SparklesIcon size={16} aria-hidden="true" />
          <span>{labels.trigger}</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              id={menuId}
              role="menu"
              aria-label={labels.trigger}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full z-50 mt-2 w-60 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <button type="button" role="menuitem" onClick={copyMarkdown} aria-live="polite" className={itemClass}>
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
                <span>{copied ? labels.copied : labels.copyMarkdown}</span>
              </button>
              <a href={claudeHref} target="_blank" rel="noopener noreferrer" role="menuitem" className={itemClass} >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 8h10" />
                  <path d="M7 12h6" />
                  <path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4Z" />
                </svg>
                <span>{labels.openClaude}</span>
              </a>
              <a href={chatgptHref} target="_blank" rel="noopener noreferrer" role="menuitem" className={itemClass} >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3a4 4 0 0 1 3.4 6.1" />
                  <path d="M12 21a4 4 0 0 1-3.4-6.1" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3a4 4 0 0 0-3.4 6.1M12 21a4 4 0 0 0 3.4-6.1" />
                </svg>
                <span>{labels.openChatgpt}</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
