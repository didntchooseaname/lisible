import { useReducedMotion } from "motion/react";
import { TextScramble } from "@/components/ui/text-scramble";

type NotFoundTitleProps = {
  text: string;
};

export function NotFoundTitle({ text }: NotFoundTitleProps) {
  const reduced = useReducedMotion();
  return (
    <TextScramble
      as="span"
      trigger={!reduced}
      duration={1}
      speed={0.05}
      characterSet="0123456789"
      className="font-mono text-6xl font-bold tracking-tight text-accent md:text-7xl"
    >
      {text}
    </TextScramble>
  );
}
