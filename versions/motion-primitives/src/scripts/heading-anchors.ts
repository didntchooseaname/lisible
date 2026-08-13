import { announce } from "../../../../shared/scripts/announce";
import { classFeedback, setupHeadingAnchors } from "../../../../shared/scripts/heading-anchors";

const copiedFeedback = classFeedback("is-copied", 1400);

setupHeadingAnchors({
  selector: "[data-heading-anchor]",
  bind: "page-load",
  urlStyle: "resolve",
  copy: "execcommand-fallback",
  feedback: (anchor) => {
    copiedFeedback(anchor);
    const copied = anchor.getAttribute("data-copied");
    if (copied) announce(copied);
  },
});
