import { announce } from "../../../../shared/scripts/announce";
import { classFeedback, setupHeadingAnchors } from "../../../../shared/scripts/heading-anchors";

const copiedFeedback = classFeedback("copied", 1400);

setupHeadingAnchors({
  selector: "a.heading-anchor",
  bind: "module",
  urlStyle: "page-hash",
  copy: "await-ignore",
  historyRequiresHash: true,
  feedback: (anchor) => {
    copiedFeedback(anchor);
    const copied = anchor.getAttribute("data-copied-label");
    if (copied) announce(copied);
  },
});
