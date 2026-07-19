import { useEffect, useRef, useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { BorderTrail } from "@/components/ui/border-trail";
import { GlowEffect } from "@/components/ui/glow-effect";
import { InView } from "@/components/ui/in-view";
import { TextMorph } from "@/components/ui/text-morph";

type NewsletterCtaProps = {
  title: string;
  description: string;
  emailLabel: string;
  placeholder: string;
  buttonLabel: string;
  doneLabel: string;
  note: string;
};

export function NewsletterCta({
  title,
  description,
  emailLabel,
  placeholder,
  buttonLabel,
  doneLabel,
  note,
}: NewsletterCtaProps) {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function handleSubscribe() {
    setDone(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2500);
  }

  return (
    <MotionConfig reducedMotion="user">
      <InView
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        viewOptions={{ once: true, margin: "0px 0px -10% 0px" }}
        once
      >
        <section
          aria-labelledby="newsletter-title"
          className="relative rounded-lg border border-border bg-card p-6 md:p-8"
        >
          {!reduced && (
            <BorderTrail
              className="bg-accent/70"
              size={80}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
          )}
          <h2 id="newsletter-title" className="text-xl font-bold tracking-tight">
            {title}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-5 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              {emailLabel}
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              placeholder={placeholder}
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground"
            />
            <div className="relative">
              {!reduced && (
                <GlowEffect
                  colors={["var(--color-accent)"]}
                  mode="breathe"
                  blur="strong"
                  scale={0.92}
                  duration={6}
                  className="opacity-30"
                />
              )}
              <button
                type="button"
                onClick={handleSubscribe}
                aria-live="polite"
                className="relative inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                <TextMorph as="span">{done ? doneLabel : buttonLabel}</TextMorph>
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{note}</p>
        </section>
      </InView>
    </MotionConfig>
  );
}
