import { ScrollProgress } from "@/components/ui/scroll-progress";

export function ScrollProgressBar() {
  return (
    <ScrollProgress
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      springOptions={{ stiffness: 280, damping: 40, restDelta: 0.001 }}
    />
  );
}
