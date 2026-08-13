export function Steps({ children }: { children?: React.ReactNode }) {
  if (!__MDX_COMPONENTS_ENABLED__) {
    return <ol className="my-6 list-decimal pl-6">{children}</ol>;
  }
  return <div className="steps">{children}</div>;
}

export function Step({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="step">
      <span className="step__marker" aria-hidden="true" />
      <div className="step__body">
        {title && <p className="step__title">{title}</p>}
        {children}
      </div>
    </div>
  );
}
