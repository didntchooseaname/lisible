
export interface ContentStrings {
  callouts: {
    note: string;
    tip: string;
    warning: string;
    caution: string;
    important: string;
  };
  diagram: {
    mermaid: string;
    drawio: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
    hint: string;
    loading: string;
    renderError: string;
  };
}

const fr: ContentStrings = {
  callouts: {
    note: "Note",
    tip: "Conseil",
    warning: "Attention",
    caution: "Prudence",
    important: "Important",
  },
  diagram: {
    mermaid: "Diagramme",
    drawio: "Diagramme draw.io",
    zoomIn: "Zoomer",
    zoomOut: "Dézoomer",
    reset: "Réinitialiser la vue",
    hint: "Molette pour zoomer, glisser pour déplacer",
    loading: "Rendu du diagramme...",
    renderError: "Le rendu du diagramme a échoué, code source ci-dessous.",
  },
};

const en: ContentStrings = {
  callouts: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    caution: "Caution",
    important: "Important",
  },
  diagram: {
    mermaid: "Diagram",
    drawio: "draw.io diagram",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    reset: "Reset view",
    hint: "Scroll to zoom, drag to pan",
    loading: "Rendering diagram...",
    renderError: "Diagram rendering failed, source shown below.",
  },
};

export const contentStrings = { fr, en } as const;
