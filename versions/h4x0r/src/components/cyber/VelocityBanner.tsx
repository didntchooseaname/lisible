import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";

export default function VelocityBanner({ text }: { text: string }) {
  return (
    <ScrollVelocityContainer className="w-full font-display text-4xl font-black uppercase tracking-[0.14em] md:text-6xl">
      <ScrollVelocityRow baseVelocity={4} direction={1} className="py-1 text-foreground/10">
        {text}
      </ScrollVelocityRow>
      <ScrollVelocityRow baseVelocity={4} direction={-1} className="py-1 text-accent/15">
        {text}
      </ScrollVelocityRow>
    </ScrollVelocityContainer>
  );
}
