import { cn } from "@/lib/utils";

export const GridDotBackground = ({
  variant = "grid",
  className,
  withFade = true,
}: {
  variant?: "grid" | "dots";
  className?: string;
  withFade?: boolean;
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div
        className={cn(
          "absolute inset-0",
          variant === "grid"
            ? "bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"
            : "bg-[radial-gradient(var(--color-border)_1.25px,transparent_1.25px)] bg-[size:20px_20px] opacity-70",
        )}
      />
      {withFade && (
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_85%)]" />
      )}
    </div>
  );
};
