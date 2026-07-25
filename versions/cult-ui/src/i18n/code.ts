interface CodeTexts {
  copy: string;
  copied: string;
  terminal: string;
  collapsedLines: string;
}

// Not `as const`: the UI dictionary derives its type from the French entries, so
// literal types here would make the English translations unassignable.
export const codeTexts: Record<"fr" | "en", CodeTexts> = {
  fr: {
    copy: "Copier le code",
    copied: "Copié",
    terminal: "Terminal",
    collapsedLines: "{lineCount} {lineCount;1=ligne masquée;lignes masquées}",
  },
  en: {
    copy: "Copy code",
    copied: "Copied",
    terminal: "Terminal",
    collapsedLines: "{lineCount} collapsed {lineCount;1=line;lines}",
  },
};
