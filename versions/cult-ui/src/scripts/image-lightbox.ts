import { createFocusTrap } from "@/lib/focus-trap";
import "./image-lightbox.css";

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
  private allClickableImages: HTMLImageElement[] = [];
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
  private clickHandlers: WeakMap<HTMLImageElement, (e: Event) => void> =
    new WeakMap();
  private mutationObserver: MutationObserver | null = null;
  private mutationRefreshId: number | null = null;

  init() {
    this.cleanupImageHandlers();
    this.cleanupMutationObserver();

    this.lightbox = document.getElementById("image-lightbox");
    this.lightboxImage = document.getElementById(
      "lightbox-image",
    ) as HTMLImageElement | null;
    this.closeBtn = document.getElementById("lightbox-close");
    this.prevBtn = document.getElementById("lightbox-prev");
    this.nextBtn = document.getElementById("lightbox-next");
    this.zoomInBtn = document.getElementById("lightbox-zoom-in");
    this.zoomOutBtn = document.getElementById("lightbox-zoom-out");
    this.zoomResetBtn = document.getElementById("lightbox-zoom-reset");
    this.currentIndexEl = document.getElementById("current-index");
    this.totalImagesEl = document.getElementById("total-images");

    if (!this.lightbox || !this.lightboxImage) return;

    this.focusTrap = createFocusTrap(this.lightbox);
    this.setupDOMListeners();

    if (!this.eventListenersSetup) {
      this.setupGlobalListeners();
      this.eventListenersSetup = true;
    }

    this.findImages();
    this.observeArticleMutations();
  }

  findImages() {
    this.cleanupImageHandlers();

    if (!window.location.pathname.includes("/blog/")) return;

    const articleContent = document.querySelector("article, [role='article']");
    if (!articleContent) return;

    const contentImages =
      articleContent.querySelectorAll<HTMLImageElement>(".prose img");
    const imagesToUse =
      contentImages.length > 0
        ? contentImages
        : articleContent.querySelectorAll<HTMLImageElement>("img");

    const allValidImages = Array.from(imagesToUse).filter((img) => {
      if (img.closest(".link-card") || img.closest(".gh-card")) return false;
      if (img.classList.contains("link-card-image")) return false;
      if (img.classList.contains("link-card-favicon")) return false;
      return true;
    });

    this.images = allValidImages;
    this.allClickableImages = allValidImages;

    allValidImages.forEach((img, index) => {
      img.style.cursor = "pointer";
      const handler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.openLightbox(index);
      };
      this.clickHandlers.set(img, handler);
      img.addEventListener("click", handler);
    });

    if (this.totalImagesEl) {
      this.totalImagesEl.textContent = this.images.length.toString();
    }
  }

  observeArticleMutations() {
    const articleContent = document.querySelector("article, [role='article']");
    if (!articleContent) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      const shouldRefresh = mutations.some((mutation) =>
        Array.from(mutation.addedNodes)
          .concat(Array.from(mutation.removedNodes))
          .some((node) => {
            if (!(node instanceof Element)) return false;
            return node.matches("img") || Boolean(node.querySelector("img"));
          }),
      );
      if (!shouldRefresh) return;
      if (this.mutationRefreshId !== null) {
        window.clearTimeout(this.mutationRefreshId);
      }
      this.mutationRefreshId = window.setTimeout(() => {
        this.mutationRefreshId = null;
        this.findImages();
      }, 50);
    });

    this.mutationObserver.observe(articleContent, {
      childList: true,
      subtree: true,
    });
  }

  setupDOMListeners() {
    this.closeBtn?.addEventListener("click", () => this.closeLightbox());
    this.prevBtn?.addEventListener("click", () => this.showPrevious());
    this.nextBtn?.addEventListener("click", () => this.showNext());
    this.zoomInBtn?.addEventListener("click", () => this.zoomIn());
    this.zoomOutBtn?.addEventListener("click", () => this.zoomOut());
    this.zoomResetBtn?.addEventListener("click", () => this.resetZoom());

    this.lightbox?.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });

    this.lightboxImage?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.hasPanned) {
        this.hasPanned = false;
        return;
      }
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
    this.lightbox?.classList.add("active");
    document.body.style.overflow = "hidden";
    this.focusTrap?.activate();
    this.preloadAdjacentImages();
  }

  closeLightbox() {
    this.lightbox?.classList.remove("active");
    document.body.style.overflow = "";
    this.resetZoom();
    this.focusTrap?.deactivate();
  }

  preloadAdjacentImages() {
    if (this.currentIndex > 0) {
      const prevImg = new Image();
      prevImg.src = this.images[this.currentIndex - 1].src;
    }
    if (this.currentIndex < this.images.length - 1) {
      const nextImg = new Image();
      nextImg.src = this.images[this.currentIndex + 1].src;
    }
  }

  showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateImage();
      this.preloadAdjacentImages();
    }
  }

  showNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.updateImage();
      this.preloadAdjacentImages();
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
    if (!this.lightboxImage) return;
    this.scale = Math.min(this.scale + 0.5, 4);
    this.clampTranslation();
    this.applyZoom();
  }

  zoomOut() {
    if (!this.lightboxImage) return;
    this.scale = Math.max(this.scale - 0.5, 1);
    if (this.scale === 1) {
      this.resetZoom();
    } else {
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
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.clientX - this.panStartX;
    const deltaY = e.clientY - this.panStartY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) this.hasPanned = true;
    this.translateX = this.panOriginX + deltaX / this.scale;
    this.translateY = this.panOriginY + deltaY / this.scale;
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
    const viewportRect = this.lightbox.getBoundingClientRect();
    const imageWidth = this.lightboxImage.offsetWidth;
    const imageHeight = this.lightboxImage.offsetHeight;
    if (!viewportRect.width || !viewportRect.height || !imageWidth || !imageHeight) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const scaledWidth = imageWidth * this.scale;
    const scaledHeight = imageHeight * this.scale;
    const maxX = Math.max(0, (scaledWidth - viewportRect.width) / 2) / this.scale;
    const maxY = Math.max(0, (scaledHeight - viewportRect.height) / 2) / this.scale;
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
    this.lightboxImage.classList.remove("zoomed");
    this.lightboxImage.classList.remove("panning");
  }

  cleanupImageHandlers() {
    this.allClickableImages.forEach((img) => {
      const handler = this.clickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.clickHandlers.delete(img);
      }
      img.style.cursor = "";
    });
    this.images = [];
    this.allClickableImages = [];
  }

  cleanupMutationObserver() {
    if (this.mutationRefreshId !== null) {
      window.clearTimeout(this.mutationRefreshId);
      this.mutationRefreshId = null;
    }
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
  }
}

const lightbox = new ImageLightbox();

lightbox.init();

document.addEventListener("astro:page-load", () => lightbox.init());
document.addEventListener("astro:before-swap", () => {
  lightbox.cleanupImageHandlers();
  lightbox.cleanupMutationObserver();
});
