import { MotionConfig } from "motion/react";
import { TextEffect } from "@/components/ui/text-effect";
import { TextLoop } from "@/components/ui/text-loop";

type HeroIntroProps = {
  title: string;
  loopPrefix: string;
  loopWords: string[];
};

export function HeroIntro({ title, loopPrefix, loopWords }: HeroIntroProps) {
  return (
    <MotionConfig reducedMotion="user">
      <TextEffect
        as="h1"
        per="word"
        preset="fade-in-blur"
        speedReveal={2}
        speedSegment={1.5}
        className="text-balance text-4xl font-bold tracking-tight md:text-5xl"
      >
        {title}
      </TextEffect>
      { }
      <div className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
        {loopPrefix}{" "}
        <TextLoop
          interval={2.6}
          className="overflow-y-clip align-bottom font-medium text-foreground"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={{
            initial: { y: "100%" },
            animate: { y: "0%" },
            exit: { y: "-100%" },
          }}
        >
          {loopWords.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </TextLoop>
      </div>
    </MotionConfig>
  );
}
