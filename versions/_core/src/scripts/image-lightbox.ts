import { createFocusTrap } from "@/lib/focus-trap";

class ImageLightbox {
  private overlay: HTMLElement | null = null;
  private image: HTMLImageElement | null = null;
  private currentIndexEl: HTMLElement | null = null;
  private totalEl: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private images: HTMLImageElement[] = [];
  private currentIndex = 0;
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  private isPanning = false;
  private hasPanned = false;
  private activePointerId: number | null = null;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;
  private focusTrap: ReturnType<typeof createFocusTrap> | null = null;
  private globalReady = false;
  private handlers = new WeakMap<HTMLImageElement, (event: Event) => void>();
  private bound: HTMLImageElement[] = [];

  init() {
    this.cleanupImages();
    this.overlay = document.getElementById("image-lightbox");
    this.image = document.getElementById("lightbox-image") as HTMLImageElement | null;
    this.currentIndexEl = document.getElementById("lightbox-current");
    this.totalEl = document.getElementById("lightbox-total");
    this.prevBtn = document.getElementById("lightbox-prev");
    this.nextBtn = document.getElementById("lightbox-next");
    if (!this.overlay || !this.image) return;

    this.focusTrap = createFocusTrap(this.overlay);
    this.setupDomListeners();
    if (!this.globalReady) {
      this.setupGlobalListeners();
      this.globalReady = true;
    }
    this.findImages();
  }

  private findImages() {
    const article = document.querySelector("article");
    if (!article) return;
    const candidates = article.querySelectorAll<HTMLImageElement>(".prose img");
    this.images = Array.from(candidates).filter((img) => {
      if (img.closest(".github-card, .link-card, .drawio-block, .mermaid-block")) return false;
      return true;
    });

    this.images.forEach((img, index) => {
      img.style.cursor = "zoom-in";
      const handler = (event: Event) => {
        event.preventDefault();
        this.open(index);
      };
      this.handlers.set(img, handler);
      img.addEventListener("click", handler);
      this.bound.push(img);
    });

    if (this.totalEl) this.totalEl.textContent = String(this.images.length);
  }

  private setupDomListeners() {
    document.getElementById("lightbox-close")?.addEventListener("click", () => this.close());
    this.prevBtn?.addEventListener("click", () => this.show(this.currentIndex - 1));
    this.nextBtn?.addEventListener("click", () => this.show(this.currentIndex + 1));
    document.getElementById("lightbox-zoom-in")?.addEventListener("click", () => this.zoom(0.5));
    document.getElementById("lightbox-zoom-out")?.addEventListener("click", () => this.zoom(-0.5));
    document.getElementById("lightbox-zoom-reset")?.addEventListener("click", () => this.resetZoom());

    this.overlay?.addEventListener("click", (event) => {
      if (event.target === this.overlay) this.close();
    });

    this.image?.addEventListener("dblclick", (event) => {
      event.preventDefault();
      if (this.scale > 1) this.resetZoom();
      else this.zoom(1);
    });
    this.image?.addEventListener("wheel", (event) => {
      event.preventDefault();
      this.zoom(event.deltaY < 0 ? 0.3 : -0.3);
    }, { passive: false });
    this.image?.addEventListener("pointerdown", (event) => this.startPan(event));
    this.image?.addEventListener("pointermove", (event) => this.movePan(event));
    this.image?.addEventListener("pointerup", (event) => this.endPan(event));
    this.image?.addEventListener("pointercancel", (event) => this.endPan(event));
    this.image?.addEventListener("click", (event) => {
      if (this.hasPanned) {
        this.hasPanned = false;
        event.stopPropagation();
      }
    });
  }

  private setupGlobalListeners() {
    document.addEventListener("keydown", (event) => {
      if (!this.overlay?.classList.contains("is-open")) return;
      if (event.key === "Escape") this.close();
      else if (event.key === "ArrowLeft") this.show(this.currentIndex - 1);
      else if (event.key === "ArrowRight") this.show(this.currentIndex + 1);
    });
  }

  private open(index: number) {
    this.currentIndex = index;
    this.update();
    this.overlay?.removeAttribute("hidden");
    this.overlay?.classList.add("is-open");
    this.overlay?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.focusTrap?.activate();
  }

  private close() {
    this.overlay?.classList.remove("is-open");
    this.overlay?.setAttribute("aria-hidden", "true");
    this.overlay?.setAttribute("hidden", "");
    document.body.style.overflow = "";
    this.resetZoom();
    this.focusTrap?.deactivate();
  }

  private show(index: number) {
    if (index < 0 || index >= this.images.length) return;
    this.currentIndex = index;
    this.update();
  }

  private update() {
    const img = this.images[this.currentIndex];
    if (!img || !this.image) return;
    this.image.src = img.currentSrc || img.src;
    this.image.alt = img.alt || "";
    if (this.currentIndexEl) this.currentIndexEl.textContent = String(this.currentIndex + 1);
    this.prevBtn?.toggleAttribute("disabled", this.currentIndex === 0);
    this.nextBtn?.toggleAttribute("disabled", this.currentIndex === this.images.length - 1);
    this.resetZoom();
  }

  private zoom(delta: number) {
    this.scale = Math.min(Math.max(this.scale + delta, 1), 4);
    if (this.scale === 1) {
      this.resetZoom();
    } else {
      this.clamp();
      this.apply();
    }
  }

  private startPan(event: PointerEvent) {
    if (!this.image || this.scale <= 1 || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    this.isPanning = true;
    this.hasPanned = false;
    this.activePointerId = event.pointerId;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panOriginX = this.translateX;
    this.panOriginY = this.translateY;
    this.image.setPointerCapture(event.pointerId);
    this.image.classList.add("is-panning");
  }

  private movePan(event: PointerEvent) {
    if (!this.image || !this.isPanning || this.activePointerId !== event.pointerId) return;
    event.preventDefault();
    const dx = event.clientX - this.panStartX;
    const dy = event.clientY - this.panStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.hasPanned = true;
    this.translateX = this.panOriginX + dx / this.scale;
    this.translateY = this.panOriginY + dy / this.scale;
    this.clamp();
    this.apply();
  }

  private endPan(event: PointerEvent) {
    if (!this.image || this.activePointerId !== event.pointerId) return;
    if (this.image.hasPointerCapture(event.pointerId)) this.image.releasePointerCapture(event.pointerId);
    this.isPanning = false;
    this.activePointerId = null;
    this.image.classList.remove("is-panning");
  }

  private clamp() {
    if (!this.image || !this.overlay) return;
    const viewport = this.overlay.getBoundingClientRect();
    const w = this.image.offsetWidth;
    const hgt = this.image.offsetHeight;
    if (!viewport.width || !viewport.height || !w || !hgt) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const maxX = Math.max(0, (w * this.scale - viewport.width) / 2) / this.scale;
    const maxY = Math.max(0, (hgt * this.scale - viewport.height) / 2) / this.scale;
    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  private apply() {
    if (!this.image) return;
    this.image.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.image.classList.add("is-zoomed");
  }

  private resetZoom() {
    if (!this.image) return;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
    this.hasPanned = false;
    this.activePointerId = null;
    this.image.style.transform = "";
    this.image.classList.remove("is-zoomed", "is-panning");
  }

  private cleanupImages() {
    for (const img of this.bound) {
      const handler = this.handlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.handlers.delete(img);
      }
      img.style.cursor = "";
    }
    this.bound = [];
    this.images = [];
  }
}

const lightbox = new ImageLightbox();
document.addEventListener("astro:page-load", () => lightbox.init());
