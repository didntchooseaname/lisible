import { createFocusTrap } from "@/lib/focus-trap";

class ImageLightbox {
  private lightbox: HTMLElement | null = null;
  private lightboxImage: HTMLImageElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private currentIndexEl: HTMLElement | null = null;
  private totalImagesEl: HTMLElement | null = null;
  private images: HTMLImageElement[] = [];
  private currentIndex = 0;
  private isZoomed = false;
  private isPanning = false;
  private hasPanned = false;
  private activePointerId: number | null = null;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  private focusTrap: ReturnType<typeof createFocusTrap> | null = null;
  private eventListenersSetup = false;
  private clickHandlers = new WeakMap<HTMLImageElement, (e: Event) => void>();

  init() {
    this.cleanupImageHandlers();

    this.lightbox = document.getElementById("image-lightbox");
    this.lightboxImage = document.getElementById(
      "lightbox-image",
    ) as HTMLImageElement | null;
    this.closeBtn = document.getElementById("lightbox-close");
    this.prevBtn = document.getElementById("lightbox-prev");
    this.nextBtn = document.getElementById("lightbox-next");
    this.currentIndexEl = document.getElementById("lightbox-current");
    this.totalImagesEl = document.getElementById("lightbox-total");

    if (!this.lightbox || !this.lightboxImage) return;

    this.focusTrap = createFocusTrap(this.lightbox);
    this.setupDOMListeners();

    if (!this.eventListenersSetup) {
      this.setupGlobalListeners();
      this.eventListenersSetup = true;
    }

    this.findImages();
  }

  findImages() {
    this.cleanupImageHandlers();

    const article = document.querySelector('article, [role="article"]');
    if (!article) return;

    const candidates = Array.from(
      article.querySelectorAll<HTMLImageElement>(".prose img"),
    ).filter((img) => {
      if (img.closest(".link-card") || img.closest(".card-github")) return false;
      if (img.closest(".drawio") || img.closest(".mermaid-block")) return false;
      if (img.classList.contains("link-card__image")) return false;
      if (img.classList.contains("link-card__favicon")) return false;
      return true;
    });

    this.images = candidates;

    candidates.forEach((img, index) => {
      img.style.cursor = "zoom-in";
      const handler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openLightbox(index);
      };
      this.clickHandlers.set(img, handler);
      img.addEventListener("click", handler);
    });

    if (this.totalImagesEl) {
      this.totalImagesEl.textContent = this.images.length.toString();
    }
  }

  setupDOMListeners() {
    this.closeBtn?.addEventListener("click", () => this.closeLightbox());
    this.prevBtn?.addEventListener("click", () => this.showPrevious());
    this.nextBtn?.addEventListener("click", () => this.showNext());

    document
      .getElementById("lightbox-zoom-in")
      ?.addEventListener("click", () => this.zoomIn());
    document
      .getElementById("lightbox-zoom-out")
      ?.addEventListener("click", () => this.zoomOut());
    document
      .getElementById("lightbox-zoom-reset")
      ?.addEventListener("click", () => this.resetZoom());

    this.lightbox?.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });

    this.lightboxImage?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.hasPanned) {
        this.hasPanned = false;
        return;
      }
    });

    this.lightboxImage?.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.toggleZoom();
    });

    this.lightboxImage?.addEventListener("pointerdown", (e) => this.startPan(e));
    this.lightboxImage?.addEventListener("pointermove", (e) => this.movePan(e));
    this.lightboxImage?.addEventListener("pointerup", (e) => this.endPan(e));
    this.lightboxImage?.addEventListener("pointercancel", (e) => this.endPan(e));

    this.lightboxImage?.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) this.zoomIn();
        else this.zoomOut();
      },
      { passive: false },
    );
  }

  setupGlobalListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.lightbox?.classList.contains("active")) return;
      switch (e.key) {
        case "Escape":
          this.closeLightbox();
          break;
        case "ArrowLeft":
          this.showPrevious();
          break;
        case "ArrowRight":
          this.showNext();
          break;
      }
    });
  }

  openLightbox(index: number) {
    this.currentIndex = index;
    this.updateImage();
    this.lightbox?.removeAttribute("hidden");
    this.lightbox?.classList.add("active");
    this.lightbox?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.focusTrap?.activate();
    this.preloadAdjacent();
  }

  closeLightbox() {
    this.lightbox?.classList.remove("active");
    this.lightbox?.setAttribute("aria-hidden", "true");
    this.lightbox?.setAttribute("hidden", "");
    document.body.style.overflow = "";
    this.resetZoom();
    this.focusTrap?.deactivate();
  }

  preloadAdjacent() {
    if (this.currentIndex > 0) {
      new Image().src = this.images[this.currentIndex - 1]?.src ?? "";
    }
    if (this.currentIndex < this.images.length - 1) {
      new Image().src = this.images[this.currentIndex + 1]?.src ?? "";
    }
  }

  showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateImage();
      this.preloadAdjacent();
    }
  }

  showNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateImage();
      this.preloadAdjacent();
    }
  }

  updateImage() {
    const img = this.images[this.currentIndex];
    if (!img || !this.lightboxImage) return;
    this.lightboxImage.src = img.currentSrc || img.src;
    this.lightboxImage.alt = img.alt || "";

    if (this.currentIndexEl) {
      this.currentIndexEl.textContent = (this.currentIndex + 1).toString();
    }
    const single = this.images.length <= 1;
    this.prevBtn?.toggleAttribute("hidden", single);
    this.nextBtn?.toggleAttribute("hidden", single);
    if (this.prevBtn) {
      this.prevBtn.toggleAttribute("disabled", this.currentIndex === 0);
    }
    if (this.nextBtn) {
      this.nextBtn.toggleAttribute(
        "disabled",
        this.currentIndex === this.images.length - 1,
      );
    }
    this.resetZoom();
  }

  toggleZoom() {
    if (this.isZoomed) this.resetZoom();
    else this.zoomIn();
  }

  zoomIn() {
    this.scale = Math.min(this.scale + 0.5, 4);
    this.clampTranslation();
    this.applyZoom();
  }

  zoomOut() {
    this.scale = Math.max(this.scale - 0.5, 1);
    if (this.scale === 1) this.resetZoom();
    else {
      this.clampTranslation();
      this.applyZoom();
    }
  }

  startPan(e: PointerEvent) {
    if (!this.lightboxImage || !this.isZoomed || this.scale <= 1) return;
    if (!e.isPrimary || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    this.isPanning = true;
    this.hasPanned = false;
    this.activePointerId = e.pointerId;
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
    this.panOriginX = this.translateX;
    this.panOriginY = this.translateY;
    this.lightboxImage.setPointerCapture(e.pointerId);
    this.lightboxImage.classList.add("panning");
  }

  movePan(e: PointerEvent) {
    if (
      !this.lightboxImage ||
      !this.isPanning ||
      this.activePointerId !== e.pointerId
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    const dx = e.clientX - this.panStartX;
    const dy = e.clientY - this.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasPanned = true;
    this.translateX = this.panOriginX + dx / this.scale;
    this.translateY = this.panOriginY + dy / this.scale;
    this.clampTranslation();
    this.applyZoom();
  }

  endPan(e: PointerEvent) {
    if (!this.lightboxImage || this.activePointerId !== e.pointerId) return;
    if (this.lightboxImage.hasPointerCapture(e.pointerId)) {
      this.lightboxImage.releasePointerCapture(e.pointerId);
    }
    this.isPanning = false;
    this.activePointerId = null;
    this.lightboxImage.classList.remove("panning");
  }

  clampTranslation() {
    if (!this.lightboxImage || !this.lightbox) return;
    const rect = this.lightbox.getBoundingClientRect();
    const w = this.lightboxImage.offsetWidth;
    const height = this.lightboxImage.offsetHeight;
    if (!rect.width || !rect.height || !w || !height) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const maxX = Math.max(0, (w * this.scale - rect.width) / 2) / this.scale;
    const maxY = Math.max(0, (height * this.scale - rect.height) / 2) / this.scale;
    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  applyZoom() {
    if (!this.lightboxImage) return;
    this.isZoomed = true;
    this.lightboxImage.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.lightboxImage.classList.add("zoomed");
  }

  resetZoom() {
    if (!this.lightboxImage) return;
    this.isZoomed = false;
    this.isPanning = false;
    this.hasPanned = false;
    this.activePointerId = null;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.lightboxImage.style.transform = "";
    this.lightboxImage.classList.remove("zoomed", "panning");
  }

  cleanupImageHandlers() {
    this.images.forEach((img) => {
      const handler = this.clickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.clickHandlers.delete(img);
      }
      img.style.cursor = "";
    });
    this.images = [];
  }
}

const lightbox = new ImageLightbox();

document.addEventListener("astro:page-load", () => lightbox.init());
document.addEventListener("astro:before-swap", () =>
  lightbox.cleanupImageHandlers(),
);
if (document.readyState !== "loading") lightbox.init();
