import { cardLocaleFromPath, type CardLocale } from "./cards";

export interface DiagramStrings {
  diagram: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  copySource: string;
  copied: string;
  error: string;
  loading: string;
}

const fr: DiagramStrings = {
  diagram: "Diagramme",
  zoomIn: "Zoom avant",
  zoomOut: "Zoom arrière",
  zoomReset: "Réinitialiser la vue",
  copySource: "Copier la source",
  copied: "Copié",
  error: "Échec du rendu du diagramme",
  loading: "Rendu du diagramme...",
};

const en: DiagramStrings = {
  diagram: "Diagram",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  zoomReset: "Reset view",
  copySource: "Copy source",
  copied: "Copied",
  error: "Failed to render diagram",
  loading: "Rendering diagram...",
};

export const diagramStrings: Record<CardLocale, DiagramStrings> = { fr, en };

export { cardLocaleFromPath };
