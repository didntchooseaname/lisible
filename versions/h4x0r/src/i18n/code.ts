
export interface CodeStrings {
  copy: string;
  copied: string;
  terminal: string;
  collapsedLines: string;
}

const fr: CodeStrings = {
  copy: "Copier le code",
  copied: "Copié",
  terminal: "Terminal",
  collapsedLines: "{lineCount} {lineCount;1=ligne masquée;lignes masquées}",
};

const en: CodeStrings = {
  copy: "Copy code",
  copied: "Copied",
  terminal: "Terminal",
  collapsedLines: "{lineCount} collapsed {lineCount;1=line;lines}",
};

export const codeStrings = { fr, en } as const;
