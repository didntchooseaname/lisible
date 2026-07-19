
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
  callout: {
    note: string;
    tip: string;
    warning: string;
    caution: string;
    important: string;
  };
  anchor: {
    label: string;
  };
  diagram: {
    label: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
    copy: string;
    copied: string;
    rendering: string;
    failed: string;
    hint: string;
    fallback: string;
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
  callout: {
    note: "Note",
    tip: "Astuce",
    warning: "Avertissement",
    caution: "Attention",
    important: "Important",
  },
  anchor: {
    label: "Copier le lien vers cette section",
  },
  diagram: {
    label: "Diagramme",
    zoomIn: "Zoom avant",
    zoomOut: "Zoom arriere",
    reset: "Reinitialiser la vue",
    copy: "Copier la source",
    copied: "Copie",
    rendering: "Rendu du diagramme...",
    failed: "Echec du rendu du diagramme",
    hint: "Molette pour zoomer, glisser pour deplacer",
    fallback: "Repli statique du diagramme",
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
  callout: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
  anchor: {
    label: "Copy link to this section",
  },
  diagram: {
    label: "Diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    copy: "Copy source",
    copied: "Copied",
    rendering: "Rendering diagram...",
    failed: "Failed to render diagram",
    hint: "Scroll to zoom, drag to pan",
    fallback: "Static diagram fallback",
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
