import { useEffect, useState } from "react";
import { Terminal } from "@/components/ui/terminal";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/lib/utils";


export type TerminalPost = {
  title: string;
  url: string;
  stamp: string;
  meta: string;
};

interface Props {
  cmd: string;
  okLine: string;
  posts: TerminalPost[];
}

export default function HomeTerminal({ cmd, okLine, posts }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase(1), cmd.length * 24 + 500);
    return () => clearTimeout(t1);
  }, [cmd]);

  return (
    <Terminal
      sequence={false}
      className="max-h-none w-full max-w-none border-border bg-card/75 shadow-[0_0_40px_var(--neon-06)] backdrop-blur-sm"
    >
      <div className="flex min-h-72 flex-col gap-3 font-mono text-[13px] leading-relaxed">
        <p className="text-muted-foreground">
          <span className="text-accent">operator@lisible</span>
          <span>:~$ </span>
          <TypingAnimation
            duration={24}
            startOnView={false}
            showCursor={phase === 0}
            className="leading-[inherit] tracking-[inherit]"
          >
            {cmd}
          </TypingAnimation>
        </p>

        <p
          className={cn(
            "text-accent transition-opacity duration-300",
            phase === 0 && "opacity-0",
          )}
        >
          {okLine}
        </p>

        {phase > 0 && (
          <AnimatedList delay={650} className="items-stretch gap-2">
            { }
            {[...posts].reverse().map((post) => (
              <a
                key={post.url}
                href={post.url}
                className="group block w-full border border-border/70 bg-background/60 px-3 py-2 transition-colors hover:border-accent/60 hover:bg-secondary/40"
              >
                <span className="block truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-accent/80">[{post.stamp}]</span> {post.meta}
                </span>
                <span className="mt-0.5 block truncate font-semibold text-foreground transition-colors group-hover:text-accent">
                  <span aria-hidden="true" className="mr-1 text-accent">
                    ▸
                  </span>
                  {post.title}
                </span>
              </a>
            ))}
          </AnimatedList>
        )}
      </div>
    </Terminal>
  );
}
