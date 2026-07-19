import { createFocusTrap } from "@/lib/focus-trap";

class ImageLightbox {
  private lightbox: HTMLElement | null = null;
  private lightboxImage: HTMLImageElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private zoomInBtn: HTMLElement | null = null;
  private zoomOutBtn: HTMLElement | null = null;
  private zoomResetBtn: HTMLElement | null = null;
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
  private globalSetup = false;
  private clickHandlers = new WeakMap<HTMLImageElement, (e: Event) => void>();
  private clickable: HTMLImageElement[] = [];

  init() {
    this.cleanupImageHandlers();

    this.lightbox = document.getElementById("image-lightbox");
    this.lightboxImage = document.getElementById("lightbox-image") as HTMLImageElement | null;
    this.closeBtn = document.getElementById("lightbox-close");
    this.prevBtn = document.getElementById("lightbox-prev");
    this.nextBtn = document.getElementById("lightbox-next");
    this.zoomInBtn = document.getElementById("lightbox-zoom-in");
    this.zoomOutBtn = document.getElementById("lightbox-zoom-out");
    this.zoomResetBtn = document.getElementById("lightbox-zoom-reset");
    this.currentIndexEl = document.getElementById("lightbox-current");
    this.totalImagesEl = document.getElementById("lightbox-total");

    if (!this.lightbox || !this.lightboxImage) return;

    this.focusTrap = createFocusTrap(this.lightbox);
    this.setupDOMListeners();
    if (!this.globalSetup) {
      this.setupGlobalListeners();
      this.globalSetup = true;
    }
    this.findImages();
  }

  private findImages() {
    this.cleanupImageHandlers();
    const article = document.querySelector("article");
    if (!article) return;
    const candidates = Array.from(article.querySelectorAll<HTMLImageElement>(".prose img"));
    this.images = candidates.filter((img) => {
      if (img.closest(".github-card") || img.closest(".link-card")) return false;
      if (img.classList.contains("link-card-image") || img.classList.contains("link-card-favicon"))
        return false;
      return true;
    });
    this.clickable = this.images;

    this.images.forEach((img, index) => {
      img.style.cursor = "zoom-in";
      const handler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.open(index);
      };
      this.clickHandlers.set(img, handler);
      img.addEventListener("click", handler);
    });

    if (this.totalImagesEl) this.totalImagesEl.textContent = String(this.images.length);
  }

  private setupDOMListeners() {
    this.closeBtn?.addEventListener("click", () => this.close());
    this.prevBtn?.addEventListener("click", () => this.showPrev());
    this.nextBtn?.addEventListener("click", () => this.showNext());
    this.zoomInBtn?.addEventListener("click", () => this.zoomIn());
    this.zoomOutBtn?.addEventListener("click", () => this.zoomOut());
    this.zoomResetBtn?.addEventListener("click", () => this.resetZoom());

    this.lightbox?.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.close();
    });

    const img = this.lightboxImage;
    if (!img) return;
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.hasPanned) {
        this.hasPanned = false;
        return;
      }
      this.toggleZoom();
    });
    img.addEventListener("pointerdown", (e) => this.startPan(e));
    img.addEventListener("pointermove", (e) => this.movePan(e));
    img.addEventListener("pointerup", (e) => this.endPan(e));
    img.addEventListener("pointercancel", (e) => this.endPan(e));
    img.addEventListener(
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

  private setupGlobalListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.lightbox?.classList.contains("active")) return;
      if (e.key === "Escape") this.close();
      else if (e.key === "ArrowLeft") this.showPrev();
      else if (e.key === "ArrowRight") this.showNext();
    });
  }

  private open(index: number) {
    this.currentIndex = index;
    this.updateImage();
    this.lightbox?.classList.add("active");
    document.body.style.overflow = "hidden";
    this.focusTrap?.activate();
  }

  private close() {
    this.lightbox?.classList.remove("active");
    document.body.style.overflow = "";
    this.resetZoom();
    this.focusTrap?.deactivate();
  }

  private showPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateImage();
    }
  }

  private showNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateImage();
    }
  }

  private updateImage() {
    const img = this.images[this.currentIndex];
    if (!img || !this.lightboxImage) return;
    this.lightboxImage.src = img.currentSrc || img.src;
    this.lightboxImage.alt = img.alt || "";
    if (this.currentIndexEl) this.currentIndexEl.textContent = String(this.currentIndex + 1);
    this.prevBtn?.toggleAttribute("disabled", this.currentIndex === 0);
    this.nextBtn?.toggleAttribute("disabled", this.currentIndex === this.images.length - 1);
    this.resetZoom();
  }

  private toggleZoom() {
    if (this.isZoomed) this.resetZoom();
    else this.zoomIn();
  }

  private zoomIn() {
    this.scale = Math.min(this.scale + 0.5, 3);
    this.clampTranslation();
    this.applyZoom();
  }

  private zoomOut() {
    this.scale = Math.max(this.scale - 0.5, 1);
    if (this.scale === 1) this.resetZoom();
    else {
      this.clampTranslation();
      this.applyZoom();
    }
  }

  private startPan(e: PointerEvent) {
    if (!this.lightboxImage || !this.isZoomed || this.scale <= 1) return;
    if (!e.isPrimary || e.button !== 0) return;
    e.preventDefault();
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

  private movePan(e: PointerEvent) {
    if (!this.lightboxImage || !this.isPanning || this.activePointerId !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - this.panStartX;
    const dy = e.clientY - this.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasPanned = true;
    this.translateX = this.panOriginX + dx / this.scale;
    this.translateY = this.panOriginY + dy / this.scale;
    this.clampTranslation();
    this.applyZoom();
  }

  private endPan(e: PointerEvent) {
    if (!this.lightboxImage || this.activePointerId !== e.pointerId) return;
    if (this.lightboxImage.hasPointerCapture(e.pointerId))
      this.lightboxImage.releasePointerCapture(e.pointerId);
    this.isPanning = false;
    this.activePointerId = null;
    this.lightboxImage.classList.remove("panning");
  }

  private clampTranslation() {
    if (!this.lightboxImage || !this.lightbox) return;
    const rect = this.lightbox.getBoundingClientRect();
    const w = this.lightboxImage.offsetWidth;
    const hgt = this.lightboxImage.offsetHeight;
    if (!rect.width || !rect.height || !w || !hgt) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const maxX = Math.max(0, (w * this.scale - rect.width) / 2) / this.scale;
    const maxY = Math.max(0, (hgt * this.scale - rect.height) / 2) / this.scale;
    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  private applyZoom() {
    if (!this.lightboxImage) return;
    this.isZoomed = true;
    this.lightboxImage.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.lightboxImage.classList.add("zoomed");
  }

  private resetZoom() {
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
    this.clickable.forEach((img) => {
      const handler = this.clickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.clickHandlers.delete(img);
      }
      img.style.cursor = "";
    });
    this.images = [];
    this.clickable = [];
  }
}

const lightbox = new ImageLightbox();
document.addEventListener("astro:page-load", () => lightbox.init());
document.addEventListener("astro:before-swap", () => lightbox.cleanupImageHandlers());
