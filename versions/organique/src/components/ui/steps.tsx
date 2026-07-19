import * as React from "react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/features";

type StepsProps = React.ComponentProps<"ol">;

function Steps({ className, ...props }: StepsProps) {
  if (!FEATURES.mdxComponents) return <ol className={className} {...props} />;
  return <ol data-slot="steps" className={cn("mdx-steps", className)} {...props} />;
}

type StepProps = React.ComponentProps<"li"> & {
  title: string;
};

function Step({ title, className, children, ...props }: StepProps) {
  if (!FEATURES.mdxComponents) {
    return (
      <li className={className} {...props}>
        <strong>{title}</strong>
        {children}
      </li>
    );
  }
  return (
    <li data-slot="step" className={cn("mdx-step", className)} {...props}>
      <span className="mdx-step-marker" aria-hidden="true" />
      <div className="mdx-step-content">
        <h4 className="mdx-step-title">{title}</h4>
        {children ? <div className="mdx-step-body">{children}</div> : null}
      </div>
    </li>
  );
}

export { Steps, Step };
