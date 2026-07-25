import { classFeedback, setupHeadingAnchors } from "../../../../shared/scripts/heading-anchors";

setupHeadingAnchors({
  selector: "a.heading-anchor",
  bind: "module",
  urlStyle: "page-hash",
  copy: "await-ignore",
  historyRequiresHash: true,
  feedback: classFeedback("copied", 1400),
});
