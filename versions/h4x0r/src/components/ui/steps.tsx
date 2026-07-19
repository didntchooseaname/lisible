import type { ReactNode } from "react";
import { FEATURES } from "@/site.config";

export function Steps({ children }: { children?: ReactNode }) {
  if (!FEATURES.mdxComponents) return <div>{children}</div>;
  return (
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
    <div className="step" role="listitem">
      <p className="step-title">{title}</p>
      <div className="step-body">{children}</div>
    </div>
  );
}
