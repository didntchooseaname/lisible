const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';

function initHeadingAnchors() {
  const article = document.querySelector<HTMLElement>("article[data-anchor-label]");
  if (!article) return;

  const copyLabel = article.dataset.anchorLabel || "Copy link";
  const copiedLabel = article.dataset.anchorCopied || "Copied";

  const headings = article.querySelectorAll<HTMLElement>(
    ".prose h2[id], .prose h3[id], .prose h4[id]",
  );

  headings.forEach((heading) => {
    if (heading.querySelector(".heading-anchor")) return;
    heading.classList.add("heading-with-anchor");

    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#${heading.id}`;
    anchor.setAttribute("aria-label", copyLabel);
    anchor.innerHTML = ICON;

    anchor.addEventListener("click", async (e) => {
      e.preventDefault();
      const url = `${location.origin}${location.pathname}#${heading.id}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
      }
      history.replaceState(null, "", `#${heading.id}`);
      anchor.classList.add("is-copied");
      anchor.setAttribute("data-feedback", copiedLabel);
      window.setTimeout(() => {
        anchor.classList.remove("is-copied");
        anchor.removeAttribute("data-feedback");
      }, 1500);
    });

    heading.appendChild(anchor);
  });
}

initHeadingAnchors();
document.addEventListener("astro:page-load", initHeadingAnchors);
