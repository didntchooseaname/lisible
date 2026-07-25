import type { ReactNode } from "react";
import { FEATURES } from "@/site.config";

export function Steps({ children }: { children?: ReactNode }) {
  if (!FEATURES.mdxComponents) return <div>{children}</div>;
  return (
    // biome-ignore lint/a11y/useSemanticElements: the styled step counter keeps div markup, list semantics come from the role
    <div className="steps not-prose" role="list">
      {children}
    </div>
  );
}

export function Step({ title, children }: { title: string; children?: ReactNode }) {
  if (!FEATURES.mdxComponents) {
    return (
      <div>
        <p>
          <strong>{title}</strong>
        </p>
        {children}
      </div>
    );
  }
  return (
    // biome-ignore lint/a11y/useSemanticElements: the styled step counter keeps div markup, list semantics come from the role
    <div className="step" role="listitem">
      <p className="step-title">{title}</p>
      <div className="step-body">{children}</div>
    </div>
  );
}
