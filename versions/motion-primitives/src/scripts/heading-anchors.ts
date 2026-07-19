function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
  return Promise.resolve();
}

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("[data-heading-anchor]");
  if (!anchor) return;
  event.preventDefault();

  const url = new URL(anchor.getAttribute("href") || "", window.location.href);
  copy(url.toString()).then(() => {
    history.replaceState(null, "", anchor.getAttribute("href") || "");
    anchor.classList.add("is-copied");
    window.setTimeout(() => anchor.classList.remove("is-copied"), 1400);
  });
}

document.addEventListener("astro:page-load", () => {
  document.removeEventListener("click", onClick);
  document.addEventListener("click", onClick);
});
