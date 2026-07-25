import type { ReactNode } from "react";

interface StepProps {
  title?: string;
  children?: ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <li className="mdx-step">
      <span className="mdx-step__marker" aria-hidden="true" />
      <div className="mdx-step__body">
        {title && <p className="mdx-step__title">{title}</p>}
        <div className="mdx-step__content">{children}</div>
      </div>
    </li>
  );
}

export function Steps({ children }: { children?: ReactNode }) {
  if (!__MDX_COMPONENTS_ENABLED__) {
    return <div className="mdx-steps mdx-steps--plain">{children}</div>;
  }
  return <ol className="mdx-steps not-prose">{children}</ol>;
}
