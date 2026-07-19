
function toggle(spoiler: HTMLElement) {
  const revealed = spoiler.classList.toggle("revealed");
  spoiler.setAttribute("aria-expanded", String(revealed));
}

document.addEventListener("click", (event) => {
  const spoiler = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-spoiler]");
  if (spoiler) toggle(spoiler);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = event.target as HTMLElement | null;
  if (!target?.matches("[data-spoiler]")) return;
  event.preventDefault();
  toggle(target);
});
