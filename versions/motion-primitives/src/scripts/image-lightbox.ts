
const IMAGE_SELECTOR =
  ".prose img:not(.link-card-favicon):not(.link-card-image)";

function isEligible(img: HTMLImageElement): boolean {
  return !img.closest(".drawio-embed, .mermaid-embed, .link-card");
}

class ImageLightbox {
  private overlay: HTMLElement | null = null;
  private image: HTMLImageElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private zoomInBtn: HTMLElement | null = null;
  private zoomOutBtn: HTMLElement | null = null;
  private zoomResetBtn: HTMLElement | null = null;
  private currentIndexEl: HTMLElement | null = null;
  private totalImagesEl: HTMLElement | null = null;

  private images: HTMLImageElement[] = [];
  private clickHandlers = new WeakMap<HTMLImageElement, (e: Event) => void>();
  private trackedImages: HTMLImageElement[] = [];

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

  private globalsBound = false;
  private lastFocused: HTMLElement | null = null;

  init() {
    this.cleanupImages();

    this.overlay = document.getElementById("image-lightbox");
    this.image = document.getElementById("lightbox-image") as HTMLImageElement | null;
    if (!this.overlay || !this.image) return;

    this.closeBtn = document.getElementById("lightbox-close");
    this.prevBtn = document.getElementById("lightbox-prev");
    this.nextBtn = document.getElementById("lightbox-next");
    this.zoomInBtn = document.getElementById("lightbox-zoom-in");
    this.zoomOutBtn = document.getElementById("lightbox-zoom-out");
    this.zoomResetBtn = document.getElementById("lightbox-zoom-reset");
    this.currentIndexEl = document.getElementById("lightbox-current");
    this.totalImagesEl = document.getElementById("lightbox-total");

    this.bindOverlay();
    if (!this.globalsBound) {
      this.bindGlobals();
      this.globalsBound = true;
    }
    this.findImages();
  }

  private findImages() {
    const nodes = Array.from(
      document.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR),
    ).filter(isEligible);
    this.images = nodes;
    this.trackedImages = nodes;
    nodes.forEach((img, index) => {
      img.style.cursor = "zoom-in";
      const handler = (e: Event) => {
        e.preventDefault();
        this.open(index);
      };
      this.clickHandlers.set(img, handler);
      img.addEventListener("click", handler);
    });
    if (this.totalImagesEl) {
      this.totalImagesEl.textContent = String(this.images.length);
    }
  }

  private bindOverlay() {
    this.closeBtn?.addEventListener("click", () => this.close());
    this.prevBtn?.addEventListener("click", () => this.showPrev());
    this.nextBtn?.addEventListener("click", () => this.showNext());
    this.zoomInBtn?.addEventListener("click", () => this.zoomIn());
    this.zoomOutBtn?.addEventListener("click", () => this.zoomOut());
    this.zoomResetBtn?.addEventListener("click", () => this.resetZoom());

    this.overlay?.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    const img = this.image;
    if (!img) return;
    img.addEventListener("dblclick", (e) => {
      e.preventDefault();
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
        if (e.deltaY < 0) this.zoomIn();
        else this.zoomOut();
      },
      { passive: false },
    );
  }

  private bindGlobals() {
    document.addEventListener("keydown", (e) => {
      if (!this.isOpen()) return;
      switch (e.key) {
        case "Escape":
          this.close();
          break;
        case "ArrowLeft":
          this.showPrev();
          break;
        case "ArrowRight":
          this.showNext();
          break;
        case "Tab":
          this.trapFocus(e);
          break;
      }
    });
  }

  private isOpen() {
    return this.overlay?.classList.contains("is-open") ?? false;
  }

  private open(index: number) {
    if (!this.overlay) return;
    this.lastFocused = document.activeElement as HTMLElement | null;
    this.currentIndex = index;
    this.update();
    this.overlay.classList.add("is-open");
    this.overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.closeBtn?.focus();
  }

  private close() {
    if (!this.overlay) return;
    this.overlay.classList.remove("is-open");
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.resetZoom();
    this.lastFocused?.focus?.({ preventScroll: true });
  }

  private showPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.update();
    }
  }

  private showNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex += 1;
      this.update();
    }
  }

  private update() {
    const source = this.images[this.currentIndex];
    if (!source || !this.image) return;
    this.image.src = source.currentSrc || source.src;
    this.image.alt = source.alt || "";
    if (this.currentIndexEl) {
      this.currentIndexEl.textContent = String(this.currentIndex + 1);
    }
    this.prevBtn?.toggleAttribute("disabled", this.currentIndex === 0);
    this.nextBtn?.toggleAttribute(
      "disabled",
      this.currentIndex === this.images.length - 1,
    );
    this.resetZoom();
  }

  private toggleZoom() {
    if (this.isZoomed) this.resetZoom();
    else this.zoomIn();
  }

  private zoomIn() {
    this.scale = Math.min(this.scale + 0.5, 4);
    this.clamp();
    this.apply();
  }

  private zoomOut() {
    this.scale = Math.max(this.scale - 0.5, 1);
    if (this.scale === 1) this.resetZoom();
    else {
      this.clamp();
      this.apply();
    }
  }

  private startPan(e: PointerEvent) {
    if (!this.image || !this.isZoomed || this.scale <= 1) return;
    if (!e.isPrimary || e.button !== 0) return;
    e.preventDefault();
    this.isPanning = true;
    this.hasPanned = false;
    this.activePointerId = e.pointerId;
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
    this.panOriginX = this.translateX;
    this.panOriginY = this.translateY;
    this.image.setPointerCapture(e.pointerId);
    this.image.classList.add("is-panning");
  }

  private movePan(e: PointerEvent) {
    if (!this.image || !this.isPanning || this.activePointerId !== e.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - this.panStartX;
    const dy = e.clientY - this.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasPanned = true;
    this.translateX = this.panOriginX + dx / this.scale;
    this.translateY = this.panOriginY + dy / this.scale;
    this.clamp();
    this.apply();
  }

  private endPan(e: PointerEvent) {
    if (!this.image || this.activePointerId !== e.pointerId) return;
    if (this.image.hasPointerCapture(e.pointerId)) {
      this.image.releasePointerCapture(e.pointerId);
    }
    this.isPanning = false;
    this.activePointerId = null;
    this.image.classList.remove("is-panning");
  }

  private clamp() {
    if (!this.image || !this.overlay) return;
    const rect = this.overlay.getBoundingClientRect();
    const w = this.image.offsetWidth;
    const h = this.image.offsetHeight;
    if (!rect.width || !rect.height || !w || !h) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const maxX = Math.max(0, (w * this.scale - rect.width) / 2) / this.scale;
    const maxY = Math.max(0, (h * this.scale - rect.height) / 2) / this.scale;
    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  private apply() {
    if (!this.image) return;
    this.isZoomed = this.scale > 1;
    this.image.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.image.classList.toggle("is-zoomed", this.isZoomed);
  }

  private resetZoom() {
    if (!this.image) return;
    this.isZoomed = false;
    this.isPanning = false;
    this.hasPanned = false;
    this.activePointerId = null;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.image.style.transform = "";
    this.image.classList.remove("is-zoomed", "is-panning");
  }

  private trapFocus(e: KeyboardEvent) {
    if (!this.overlay) return;
    const focusables = Array.from(
      this.overlay.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  cleanupImages() {
    this.trackedImages.forEach((img) => {
      const handler = this.clickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.clickHandlers.delete(img);
      }
      img.style.cursor = "";
    });
    this.images = [];
    this.trackedImages = [];
  }
}

const lightbox = new ImageLightbox();

document.addEventListener("astro:page-load", () => lightbox.init());
document.addEventListener("astro:before-swap", () => {
  document.body.style.overflow = "";
  lightbox.cleanupImages();
});
