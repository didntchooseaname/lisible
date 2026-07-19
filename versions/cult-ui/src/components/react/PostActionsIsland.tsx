import { useState } from "react";
import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { FamilyButton } from "@/components/ui/family-button";
import { TextureButton } from "@/components/ui/texture-button";

interface PostActionsIslandProps {
  url: string;
  title: string;
  openLabel: string;
  closeLabel: string;
  copyLabel: string;
  copiedLabel: string;
  shareLabel: string;
}

export function PostActionsIsland({
  url,
  title,
  openLabel,
  closeLabel,
  copyLabel,
  copiedLabel,
  shareLabel,
}: PostActionsIslandProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const shareHref = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <FamilyButton expandLabel={openLabel} collapseLabel={closeLabel}>
      <div className="flex flex-col items-center gap-3 pt-5">
        <TextureButton
          variant="icon"
          size="icon"
          aria-label={copied ? copiedLabel : copyLabel}
          onClick={copyLink}
          className="h-11 w-11"
        >
          {copied ? (
            <Check size={20} aria-hidden="true" className="text-accent" />
          ) : (
            <LinkIcon
              size={20}
              aria-hidden="true"
              className="text-foreground"
            />
          )}
        </TextureButton>
        <a
          href={shareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={shareLabel}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Share2 size={20} aria-hidden="true" />
        </a>
        <span aria-live="polite" className="sr-only">
          {copied ? copiedLabel : ""}
        </span>
      </div>
    </FamilyButton>
  );
}

export default PostActionsIsland;
