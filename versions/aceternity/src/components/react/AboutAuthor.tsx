"use client";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

export default function AboutAuthor({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: string;
}) {
  return (
    <div className="flex items-center">
      <AnimatedTooltip
        items={[{ id: 1, name, designation: role, image }]}
      />
    </div>
  );
}
