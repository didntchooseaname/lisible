export const VARIANTS = [
  {
    id: "motion-primitives",
    label: "Swiss minimalism, typographic micro-interactions",
    description: "Micro-interactions typographiques sobres",
    port: 4321,
  },
  {
    id: "cult-ui",
    label: "Editorial, gradient headings, textured controls",
    description: "Magazine éditorial, boutons texturés et titres dégradés",
    port: 4322,
  },
  {
    id: "aceternity",
    label: "Spotlight, bento grid, tracing beam",
    description: "Spotlight, grille bento et tracing beam",
    port: 4323,
  },
  {
    id: "reactbits",
    label: "Dense animated components, pill nav",
    description: "Composants animés, navigation en pilules et fonds à points",
    port: 4324,
  },
  {
    id: "organique",
    label: "Interactive knowledge graph, floating dock",
    description: "Knowledge graph interactif, formes organiques et dock flottant",
    port: 4325,
  },
  {
    id: "h4x0r",
    label: "Immersive terminal HUD, interactive background",
    description: "Terminal HUD néon immersif et fond interactif",
    port: 4326,
  },
] as const;

export type PublicVariant = (typeof VARIANTS)[number]["id"];

export const VARIANT_IDS = VARIANTS.map(({ id }) => id);

export function isPublicVariant(value: unknown): value is PublicVariant {
  return typeof value === "string" && VARIANT_IDS.some((id) => id === value);
}
