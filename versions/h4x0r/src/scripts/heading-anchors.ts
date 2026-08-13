let feedbackTimer: number | undefined;

// Local copy of shared/scripts/announce: inline scripts cannot import.
let live: HTMLElement | null = null;
function announce(message: string): void {
  if (!live?.isConnected) {
    live = document.createElement("p");
    live.setAttribute("role", "status");
    live.style.cssText =
      "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0";
    document.body.append(live);
  }
  live.textContent = "";
  const region = live;
  window.setTimeout(() => {
    region.textContent = message;
  }, 30);
}

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("a.heading-anchor");
  if (!anchor) return;

  const url = new URL(anchor.getAttribute("href") ?? "#", window.location.href).toString();

  void navigator.clipboard?.writeText(url).then(() => {
    document.querySelector(".anchor-feedback")?.remove();
    if (feedbackTimer) window.clearTimeout(feedbackTimer);

    const copied = anchor.getAttribute("data-anchor-copied") ?? "";
    const bubble = document.createElement("span");
    bubble.className = "anchor-feedback";
    bubble.setAttribute("role", "status");
    bubble.textContent = copied;
    anchor.insertAdjacentElement("afterend", bubble);
    if (copied) announce(copied);

    feedbackTimer = window.setTimeout(() => bubble.remove(), 1600);
  });
});

export {};
