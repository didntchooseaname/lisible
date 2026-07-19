document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("a.heading-anchor");
  if (!anchor) return;

  event.preventDefault();
  const hash = anchor.getAttribute("href") ?? "";
  const url = `${location.origin}${location.pathname}${hash}`;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
  }

  if (hash) history.replaceState(null, "", hash);

  anchor.classList.add("copied");
  window.setTimeout(() => anchor.classList.remove("copied"), 1400);
});
