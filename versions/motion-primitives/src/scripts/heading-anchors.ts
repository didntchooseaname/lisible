import { classFeedback, setupHeadingAnchors } from "../../../../shared/scripts/heading-anchors";

setupHeadingAnchors({
  selector: "[data-heading-anchor]",
  bind: "page-load",
  urlStyle: "resolve",
  copy: "execcommand-fallback",
  feedback: classFeedback("is-copied", 1400),
});
