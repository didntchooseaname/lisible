import * as React from "react";
import { cn } from "@/lib/utils";

type StepsProps = React.ComponentProps<"ol">;

function Steps({ className, children, ...props }: StepsProps) {
  if (!__MDX_COMPONENTS_ENABLED__) {
    return (
      <ol className={cn("my-6 list-decimal pl-6", className)} {...props}>
        {children}
      </ol>
    );
  }
  return (
    <ol className={cn("mdx-steps", className)} {...props}>
      {children}
    </ol>
  );
}

type StepProps = React.ComponentProps<"li"> & { title: string };

function Step({ title, className, children, ...props }: StepProps) {
  if (!__MDX_COMPONENTS_ENABLED__) {
    return (
      <li className={className} {...props}>
        <strong>{title}</strong>
        {children}
      </li>
    );
  }
  return (
    <li className={cn("mdx-step", className)} {...props}>
      <span className="mdx-step-marker" aria-hidden="true"></span>
      <div className="mdx-step-content">
        <h4 className="mdx-step-title">{title}</h4>
        {children ? <div className="mdx-step-body">{children}</div> : null}
      </div>
    </li>
  );
}

export { Steps, Step };
