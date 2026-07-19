export function pluginLanguageBadge() {
  return {
    name: "Language Badge",
    hooks: {
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        if (!codeBlock || !renderData?.blockAst?.properties) return;

        const language = codeBlock.language || "text";
        renderData.blockAst.properties["data-language"] = language;
      },
    },
    baseStyles: `
      .expressive-code figure[data-language]::before {
        content: attr(data-language);
        position: absolute;
        top: 0.6rem;
        right: 0.6rem;
        background: color-mix(in oklab, var(--color-muted) 50%, transparent);
        border: 1px solid var(--color-border);
        border-radius: calc(var(--radius) - 4px);
        color: var(--color-muted-foreground);
        padding: 0.125rem 0.5rem;
        font-size: 0.625rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        pointer-events: none;
        z-index: 10;
        opacity: 1;
        transition: opacity 0.15s ease-in-out;
        font-family: var(--font-mono);
        line-height: 1.5;
      }

      .expressive-code figure[data-language]:hover::before,
      .expressive-code figure[data-language]:has(.copy button:focus-visible)::before {
        opacity: 0;
        visibility: hidden;
      }

      .expressive-code .copy {
        z-index: 11;
      }
    `,
  };
}
