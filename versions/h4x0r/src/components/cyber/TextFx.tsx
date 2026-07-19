import { HyperText } from "@/components/ui/hyper-text";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { TextReveal } from "@/components/ui/text-reveal";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { cn } from "@/lib/utils";


export function HyperTitle({
  text,
  className,
  duration = 1000,
  delay = 0,
  startOnView = false,
  characters,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  startOnView?: boolean;
  characters?: string;
}) {
  return (
    <HyperText
      as="span"
      className={className}
      duration={duration}
      delay={delay}
      startOnView={startOnView}
      characterSet={characters ? characters.split("") : undefined}
    >
      {text}
    </HyperText>
  );
}

export function TypeLine({
  text,
  className,
  duration = 20,
  delay = 0,
  startOnView = false,
  showCursor = true,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  startOnView?: boolean;
  showCursor?: boolean;
}) {
  return (
    <TypingAnimation
      as="span"
      className={cn("leading-[inherit] tracking-[inherit]", className)}
      duration={duration}
      delay={delay}
      startOnView={startOnView}
      showCursor={showCursor}
      cursorStyle="block"
    >
      {text}
    </TypingAnimation>
  );
}

export function RevealText({ text, className }: { text: string; className?: string }) {
  return <TextReveal className={className}>{text}</TextReveal>;
}

export function ShadowTitle({ text, className }: { text: string; className?: string }) {
  return (
    <LineShadowText as="span" shadowColor="var(--color-accent)" className={className}>
      {text}
    </LineShadowText>
  );
}
