document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const spoiler = target?.closest<HTMLElement>("[data-spoiler]");
  if (!spoiler) return;
  const revealed = spoiler.classList.toggle("is-revealed");
  spoiler.setAttribute("aria-expanded", revealed ? "true" : "false");
});
