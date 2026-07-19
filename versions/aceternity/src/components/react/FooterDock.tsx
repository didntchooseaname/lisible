"use client";
import { Rss } from "lucide-react";
import { FloatingDock, type DockItem } from "@/components/ui/floating-dock";

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function FooterDock({
  githubHref,
  githubLabel,
  rssHref,
  rssLabel,
  toggleLabel,
}: {
  githubHref: string;
  githubLabel: string;
  rssHref: string;
  rssLabel: string;
  toggleLabel: string;
}) {
  const items: DockItem[] = [
    ...(githubHref
      ? [
          {
            title: githubLabel,
            href: githubHref,
            icon: <GithubIcon />,
          },
        ]
      : []),
    {
      title: rssLabel,
      href: rssHref,
      icon: <Rss className="h-full w-full" aria-hidden="true" />,
    },
  ];

  return (
    <FloatingDock
      items={items}
      toggleLabel={toggleLabel}
      desktopClassName="h-14"
    />
  );
}
