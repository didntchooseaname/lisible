
export interface CodeUiStrings {
  copy: string;
  copied: string;
  terminalTitle: string;
  collapsedLines: string;
}

export const codeUi: Record<"fr" | "en", CodeUiStrings> = {
  fr: {
    copy: "Copier le code",
    copied: "Copié !",
    terminalTitle: "Terminal",
    collapsedLines: "{lineCount} {lineCount;1=ligne masquée;lignes masquées}",
  },
  en: {
    copy: "Copy code",
    copied: "Copied!",
    terminalTitle: "Terminal",
    collapsedLines: "{lineCount} collapsed {lineCount;1=line;lines}",
  },
};
