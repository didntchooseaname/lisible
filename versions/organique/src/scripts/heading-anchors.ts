function initHeadingAnchors() {
  document.removeEventListener("click", onClick);
  document.addEventListener("click", onClick);
}

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("[data-heading-anchor]");
  if (!anchor) return;
  if (!navigator.clipboard) return;

  event.preventDefault();
  const url = new URL(anchor.getAttribute("href") ?? "", window.location.href).toString();
  history.replaceState(null, "", anchor.getAttribute("href") ?? "");
  navigator.clipboard.writeText(url).then(
    () => {
      anchor.classList.add("is-copied");
      window.setTimeout(() => anchor.classList.remove("is-copied"), 1400);
    },
    () => {},
  );
}

document.addEventListener("astro:page-load", initHeadingAnchors);
