import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";


interface PostShareLabels {
  shareTitle: string;
  x: string;
  bluesky: string;
  linkedin: string;
  mastodon: string;
  copyLink: string;
  copied: string;
  mastodonPrompt: string;
  aiLabel: string;
  aiMenuTitle: string;
  copyMarkdown: string;
  copiedMarkdown: string;
  openInClaude: string;
  openInChatGPT: string;
  viewMarkdown: string;
}

interface PostShareIslandProps {
  url: string;
  title: string;
  markdownUrl?: string;
  showShare: boolean;
  showAi: boolean;
  labels: PostShareLabels;
}

const MASTODON_KEY = "mastodon-instance";

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function BlueskyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 600 530"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M135.72 44.03C202.216 93.951 273.74 195.17 300 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.38-3.69-10.832-3.708-7.896-.017-2.936-1.193.516-3.707 7.896-13.717 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.45-163.25-81.433C20.15 217.61 9.997 86.535 9.997 68.825c0-88.687 77.742-60.816 125.72-24.795z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MastodonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545z" />
    </svg>
  );
}

function ShareIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}

export function PostShareIsland({
  url,
  title,
  markdownUrl,
  showShare,
  showAi,
  labels,
}: PostShareIslandProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [status, setStatus] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shareText = `${title} ${url}`;

  const xHref = `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`;
  const blueskyHref = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const aiPrompt = markdownUrl
    ? `${title}\n${markdownUrl}`
    : `${title}\n${url}`;
  const claudeHref = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;
  const chatgptHref = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt)}`;

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2000);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      flash(labels.copied);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  }, [url, labels.copied, flash]);

  const shareMastodon = useCallback(() => {
    let instance = "";
    try {
      instance = localStorage.getItem(MASTODON_KEY) ?? "";
    } catch {
    }
    if (!instance) {
      const input = window.prompt(labels.mastodonPrompt, "mastodon.social");
      if (!input) return;
      instance = input.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
      if (!instance) return;
      try {
        localStorage.setItem(MASTODON_KEY, instance);
      } catch {
      }
    }
    const href = `https://${instance}/share?text=${encodeURIComponent(shareText)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }, [labels.mastodonPrompt, shareText]);

  const copyMarkdown = useCallback(async () => {
    if (!markdownUrl) return;
    try {
      const response = await fetch(markdownUrl);
      const text = response.ok ? await response.text() : url;
      await navigator.clipboard.writeText(text);
      setCopiedMd(true);
      flash(labels.copiedMarkdown);
      window.setTimeout(() => setCopiedMd(false), 2000);
    } catch {
    }
    setAiOpen(false);
  }, [markdownUrl, url, labels.copiedMarkdown, flash]);

  useEffect(() => {
    if (!aiOpen) return;
    function onPointer(event: MouseEvent | TouchEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      if (triggerRef.current?.contains(event.target as Node)) return;
      setAiOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAiOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [aiOpen]);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
      {showShare ? (
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={labels.shareTitle}
        >
          <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {labels.shareTitle}
          </span>
          <ShareIcon href={xHref} label={labels.x}>
            <XIcon />
          </ShareIcon>
          <ShareIcon href={blueskyHref} label={labels.bluesky}>
            <BlueskyIcon />
          </ShareIcon>
          <ShareIcon href={linkedinHref} label={labels.linkedin}>
            <LinkedinIcon />
          </ShareIcon>
          <button
            type="button"
            onClick={shareMastodon}
            aria-label={labels.mastodon}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <MastodonIcon />
          </button>
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? labels.copied : labels.copyLink}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? (
              <Check size={18} aria-hidden="true" className="text-accent" />
            ) : (
              <LinkIcon size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        <span />
      )}

      {showAi && markdownUrl ? (
        <div className="relative">
          <TextureButton
            ref={triggerRef}
            variant="secondary"
            size="sm"
            aria-haspopup="menu"
            aria-expanded={aiOpen}
            aria-controls={aiOpen ? menuId : undefined}
            onClick={() => setAiOpen((open) => !open)}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={15} aria-hidden="true" />
              {labels.aiLabel}
            </span>
          </TextureButton>
          {aiOpen && (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={labels.aiMenuTitle}
              className="absolute bottom-full right-0 z-50 mb-2 w-60 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={copyMarkdown}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary"
              >
                {copiedMd ? (
                  <Check size={15} aria-hidden="true" className="text-accent" />
                ) : (
                  <Copy size={15} aria-hidden="true" className="text-muted-foreground" />
                )}
                {copiedMd ? labels.copiedMarkdown : labels.copyMarkdown}
              </button>
              <a
                href={claudeHref}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setAiOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <ExternalLink size={15} aria-hidden="true" className="text-muted-foreground" />
                {labels.openInClaude}
              </a>
              <a
                href={chatgptHref}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setAiOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <ExternalLink size={15} aria-hidden="true" className="text-muted-foreground" />
                {labels.openInChatGPT}
              </a>
              <a
                href={markdownUrl}
                role="menuitem"
                onClick={() => setAiOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <FileText size={15} aria-hidden="true" className="text-muted-foreground" />
                {labels.viewMarkdown}
              </a>
            </div>
          )}
        </div>
      ) : (
        <span />
      )}

      <span aria-live="polite" className={cn("sr-only")}>
        {status}
      </span>
    </div>
  );
}

export default PostShareIsland;
