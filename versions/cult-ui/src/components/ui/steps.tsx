import { Children, isValidElement, type ReactNode } from "react";

interface StepProps {
  title?: string;
  children: ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <li className="relative pb-8 pl-10 last:pb-0">
      { }
      <span
        aria-hidden="true"
        className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
      />
      { }
      <span
        aria-hidden="true"
        className="steps-marker absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground"
      />
      {title ? (
        <p className="mt-1 mb-2 text-base font-semibold leading-tight text-foreground">
          {title}
        </p>
      ) : null}
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </li>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children).filter((child) =>
    isValidElement(child),
  );
  return (
    <ol className="steps-list not-prose my-6 list-none pl-0">{steps}</ol>
  );
}

export default Steps;
