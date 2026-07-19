function copiedLabel(): string {
  return document.querySelector("article")?.getAttribute("data-anchor-copied") || "Copied";
}

function showToast(anchor: HTMLElement, label: string) {
  const heading = anchor.closest("h2, h3, h4");
  if (!heading) return;
  heading.querySelector(".heading-anchor-toast")?.remove();
  const toast = document.createElement("span");
  toast.className = "heading-anchor-toast";
  toast.textContent = label;
  toast.setAttribute("role", "status");
  heading.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 200);
  }, 1200);
}

function onClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>("[data-heading-anchor]");
  if (!anchor) return;
  event.preventDefault();
  const id = anchor.getAttribute("href")?.slice(1) ?? "";
  const url = `${location.origin}${location.pathname}#${id}`;

  const done = () => {
    showToast(anchor, copiedLabel());
    history.replaceState(null, "", `#${id}`);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(done);
  } else {
    done();
  }
}

document.addEventListener("click", onClick);
