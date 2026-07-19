
export interface CardStrings {
  github: {
    stars: string;
    forks: string;
    language: string;
    loading: string;
    viewOnGithub: string;
  };
  link: {
    preview: string;
  };
}

const fr: CardStrings = {
  github: {
    stars: "Etoiles",
    forks: "Forks",
    language: "Langage principal",
    loading: "Chargement des informations du depot...",
    viewOnGithub: "Voir le depot sur GitHub",
  },
  link: {
    preview: "Apercu du lien",
  },
};

const en: CardStrings = {
  github: {
    stars: "Stars",
    forks: "Forks",
    language: "Main language",
    loading: "Loading repository information...",
    viewOnGithub: "View the repository on GitHub",
  },
  link: {
    preview: "Link preview",
  },
};

export const cardStrings = { fr, en } as const;

export type CardLocale = keyof typeof cardStrings;

export function cardLocaleFromPath(filePath: string | undefined): CardLocale {
  if (!filePath) return "fr";
  const normalized = filePath.replaceAll("\\", "/");
  const match = normalized.match(/\/content\/[^/]+\/([a-z]{2})\//);
  if (match && match[1] in cardStrings) return match[1] as CardLocale;
  return "fr";
}
