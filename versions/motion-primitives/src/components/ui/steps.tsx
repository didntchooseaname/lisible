import type { ReactNode } from "react";

export function Steps({ children }: { children?: ReactNode }) {
  return <div className="mdx-steps">{children}</div>;
}

export function Step({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mdx-step">
      <div className="mdx-step-marker" aria-hidden="true" />
      <div className="mdx-step-body">
        {title ? <p className="mdx-step-title">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
