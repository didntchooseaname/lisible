
let feedbackTimer: number | undefined;

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("a.heading-anchor");
  if (!anchor) return;

  const url = new URL(anchor.getAttribute("href") ?? "#", window.location.href).toString();

  void navigator.clipboard?.writeText(url).then(() => {
    document.querySelector(".anchor-feedback")?.remove();
    if (feedbackTimer) window.clearTimeout(feedbackTimer);

    const bubble = document.createElement("span");
    bubble.className = "anchor-feedback";
    bubble.setAttribute("role", "status");
    bubble.textContent = anchor.getAttribute("data-anchor-copied") ?? "";
    anchor.insertAdjacentElement("afterend", bubble);

    feedbackTimer = window.setTimeout(() => bubble.remove(), 1600);
  });
});
