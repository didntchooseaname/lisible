const FEEDBACK = {
  fr: "Lien copié",
  en: "Link copied",
} as const;

const CHECK_ICON =
  '<svg class="heading-anchor-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function feedbackText(): string {
  return document.documentElement.lang === "en" ? FEEDBACK.en : FEEDBACK.fr;
}

function showBubble(anchor: HTMLElement) {
  const existing = anchor.querySelector(".heading-anchor-bubble");
  if (existing) existing.remove();
  const bubble = document.createElement("span");
  bubble.className = "heading-anchor-bubble";
  bubble.textContent = feedbackText();
  bubble.setAttribute("role", "status");
  anchor.appendChild(bubble);
  window.setTimeout(() => bubble.remove(), 1400);
}

async function onClick(event: MouseEvent) {
  const anchor = (event.target as HTMLElement)?.closest<HTMLElement>(
    "[data-heading-anchor]",
  );
  if (!anchor) return;
  event.preventDefault();

  const href = anchor.getAttribute("href") ?? "";
  const url = `${location.origin}${location.pathname}${href}`;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
  }
  history.replaceState(null, "", href);

  const original = anchor.innerHTML;
  anchor.innerHTML = CHECK_ICON;
  anchor.classList.add("is-copied");
  showBubble(anchor);
  window.setTimeout(() => {
    anchor.innerHTML = original;
    anchor.classList.remove("is-copied");
  }, 1400);
}

function bind() {
  document.removeEventListener("click", onClick);
  document.addEventListener("click", onClick);
}

bind();
document.addEventListener("astro:page-load", bind);
