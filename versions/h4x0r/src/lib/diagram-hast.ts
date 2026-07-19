import { h } from "hastscript";
import type { ElementContent } from "hast";
import type { ContentStrings } from "#src/i18n/content";

const toolbarIcon = (paths: string[], size = 15): ElementContent =>
  h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      width: String(size),
      height: String(size),
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.75",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    paths.map((d) => h("path", { d })),
  );

const diagramIcon = (): ElementContent =>
  toolbarIcon([
    "M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "M4.5 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "M19.5 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "M10.2 6.3 6 10.5",
    "m14 6.3 4.2 4.2",
    "M6.35 17.65 10.5 13.5",
    "m13.5 13.5 4.15 4.15",
  ]);

const zoomOutIcon = (): ElementContent =>
  toolbarIcon(["M21 21l-4.34-4.34", "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M8 11h6"]);

const zoomInIcon = (): ElementContent =>
  toolbarIcon([
    "M21 21l-4.34-4.34",
    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z",
    "M8 11h6",
    "M11 8v6",
  ]);

const resetIcon = (): ElementContent =>
  toolbarIcon(["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", "M3 3v5h5"]);

const controlButton = (
  attr: string,
  label: string,
  iconEl: ElementContent,
): ElementContent =>
  h(
    "button",
    {
      type: "button",
      class: "diagram-btn",
      [attr]: "",
      "aria-label": label,
      title: label,
    },
    [iconEl],
  );

export function diagramShell(options: {
  kind: "mermaid" | "drawio";
  label: string;
  strings: ContentStrings["diagram"];
  dataAttributes: Record<string, string>;
  fallback: ElementContent[];
}): ElementContent {
  const { kind, label, strings, dataAttributes, fallback } = options;

  return h(
    "div",
    {
      class: `diagram-block diagram-${kind}`,
      [`data-${kind}`]: "",
      ...dataAttributes,
    },
    [
      h("div", { class: "diagram-toolbar" }, [
        h("span", { class: "diagram-label" }, [diagramIcon(), h("span", label)]),
        h("span", { class: "diagram-controls" }, [
          controlButton("data-diagram-zoom-out", strings.zoomOut, zoomOutIcon()),
          h("span", { class: "diagram-zoom-level", "data-diagram-zoom-level": "" }, "100%"),
          controlButton("data-diagram-zoom-in", strings.zoomIn, zoomInIcon()),
          controlButton("data-diagram-reset", strings.reset, resetIcon()),
        ]),
      ]),
      h("div", { class: "diagram-viewport", "data-diagram-viewport": "" }, [
        h("div", { class: "diagram-pan", "data-diagram-pan": "" }),
        h("p", { class: "diagram-hint", "aria-hidden": "true" }, strings.hint),
      ]),
      h("p", { class: "diagram-error", role: "status" }, strings.renderError),
      h("div", { class: "diagram-fallback" }, fallback),
    ],
  );
}
