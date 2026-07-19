import { MotionConfig } from "motion/react";
import { TextEffect } from "@/components/ui/text-effect";

type PostTitleProps = {
  title: string;
};

export function PostTitle({ title }: PostTitleProps) {
  return (
    <MotionConfig reducedMotion="user">
      <TextEffect
        as="h1"
        per="word"
        preset="blur"
        speedReveal={2.5}
        speedSegment={2}
        className="text-balance text-3xl font-bold tracking-tight md:text-4xl"
      >
        {title}
      </TextEffect>
    </MotionConfig>
  );
}
