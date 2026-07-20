import { createFocusTrap, type FocusTrap } from "@/lib/focus-trap";

const MAX_SCALE = 4;
const STEP = 0.5;

class ImageLightbox {
  private lightbox: HTMLElement | null = null;
  private image: HTMLImageElement | null = null;
  private stage: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private counterEl: HTMLElement | null = null;
  private counterTemplate = "{current} / {total}";
  private images: HTMLImageElement[] = [];
  private currentIndex = 0;
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  private hasPanned = false;
  private focusTrap: FocusTrap | null = null;
  private globalListenersSetup = false;
  private clickHandlers = new WeakMap<HTMLImageElement, (event: Event) => void>();
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartScale = 1;
  private panStart = { x: 0, y: 0, originX: 0, originY: 0 };

  init() {
    this.cleanupImageHandlers();

    this.lightbox = document.getElementById("image-lightbox");
    if (!this.lightbox) return;
    this.image = this.lightbox.querySelector<HTMLImageElement>("[data-lightbox-image]");
    this.stage = this.lightbox.querySelector<HTMLElement>("[data-lightbox-stage]");
    this.prevBtn = this.lightbox.querySelector<HTMLButtonElement>("[data-lightbox-prev]");
    this.nextBtn = this.lightbox.querySelector<HTMLButtonElement>("[data-lightbox-next]");
    this.counterEl = this.lightbox.querySelector<HTMLElement>("[data-lightbox-counter]");
    this.counterTemplate =
      this.counterEl?.getAttribute("data-counter-template") ?? this.counterTemplate;

    this.focusTrap = createFocusTrap(this.lightbox);
    this.setupOverlayListeners();

    if (!this.globalListenersSetup) {
      this.setupGlobalListeners();
      this.globalListenersSetup = true;
    }

    this.findImages();
  }

  private findImages() {
    const article = document.querySelector("article");
    if (!article) return;

    const candidates = article.querySelectorAll<HTMLImageElement>(".prose img, [data-post-cover] img");
    this.images = Array.from(candidates).filter((img) => {
      if (img.closest(".link-card")) return false;
      if (img.closest(".github-card")) return false;
      if (img.closest(".diagram-block")) return false;
      return true;
    });

    this.images.forEach((img, index) => {
      img.classList.add("lightbox-target");
      const handler = (event: Event) => {
        event.preventDefault();
        this.open(index);
      };
      this.clickHandlers.set(img, handler);
      img.addEventListener("click", handler);
    });
  }

  private setupOverlayListeners() {
    if (!this.lightbox || !this.image || !this.stage) return;

    this.lightbox
      .querySelector("[data-lightbox-close]")
      ?.addEventListener("click", () => this.close());
    this.lightbox
      .querySelector("[data-lightbox-zoom-in]")
      ?.addEventListener("click", () => this.zoomTo(this.scale + STEP));
    this.lightbox
      .querySelector("[data-lightbox-zoom-out]")
      ?.addEventListener("click", () => this.zoomTo(this.scale - STEP));
    this.lightbox
      .querySelector("[data-lightbox-reset]")
      ?.addEventListener("click", () => this.resetZoom());
    this.prevBtn?.addEventListener("click", () => this.showPrevious());
    this.nextBtn?.addEventListener("click", () => this.showNext());

    this.stage.addEventListener("click", (event) => {
      if (event.target === this.stage) this.close();
    });

    this.image.addEventListener("dblclick", (event) => {
      event.preventDefault();
      if (this.scale > 1) this.resetZoom();
      else this.zoomTo(2);
    });

    this.image.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.zoomTo(this.scale + (event.deltaY < 0 ? 0.25 : -0.25));
      },
      { passive: false },
    );

    this.image.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.image.addEventListener("pointermove", (event) => this.onPointerMove(event));
    this.image.addEventListener("pointerup", (event) => this.onPointerUp(event));
    this.image.addEventListener("pointercancel", (event) => this.onPointerUp(event));
    this.image.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  private setupGlobalListeners() {
    document.addEventListener("keydown", (event) => {
      if (!this.lightbox?.classList.contains("active")) return;
      switch (event.key) {
        case "Escape":
          this.close();
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

  private open(index: number) {
    if (!this.lightbox) return;
    this.currentIndex = index;
    this.updateImage();
    this.lightbox.removeAttribute("hidden");
    this.lightbox.classList.add("active");
    this.lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    this.focusTrap?.activate();
    this.preloadAdjacent();
  }

  close() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove("active");
    this.lightbox.setAttribute("aria-hidden", "true");
    this.lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
    this.resetZoom();
    this.focusTrap?.deactivate();
  }

  private preloadAdjacent() {
    for (const offset of [-1, 1]) {
      const neighbor = this.images[this.currentIndex + offset];
      if (neighbor) new Image().src = neighbor.currentSrc || neighbor.src;
    }
  }

  private showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.updateImage();
      this.preloadAdjacent();
    }
  }

  private showNext() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex += 1;
      this.updateImage();
      this.preloadAdjacent();
    }
  }

  private updateImage() {
    const source = this.images[this.currentIndex];
    if (!source || !this.image) return;
    this.image.src = source.currentSrc || source.src;
    this.image.alt = source.alt || "";

    if (this.counterEl) {
      this.counterEl.textContent = this.counterTemplate
        .replace("{current}", String(this.currentIndex + 1))
        .replace("{total}", String(this.images.length));
    }
    this.prevBtn?.toggleAttribute("disabled", this.currentIndex === 0);
    this.nextBtn?.toggleAttribute("disabled", this.currentIndex === this.images.length - 1);
    this.resetZoom();
  }

  private zoomTo(next: number) {
    this.scale = Math.min(Math.max(next, 1), MAX_SCALE);
    if (this.scale === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    this.clampTranslation();
    this.applyTransform();
  }

  private onPointerDown(event: PointerEvent) {
    if (!this.image) return;
    event.preventDefault();
    this.image.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y);
      this.pinchStartScale = this.scale;
    } else if (this.pointers.size === 1 && this.scale > 1) {
      this.hasPanned = false;
      this.panStart = {
        x: event.clientX,
        y: event.clientY,
        originX: this.translateX,
        originY: this.translateY,
      };
      this.image.classList.add("panning");
    }
  }

  private onPointerMove(event: PointerEvent) {
    if (!this.image || !this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinchStartDistance > 0) {
        this.zoomTo(this.pinchStartScale * (distance / this.pinchStartDistance));
      }
      return;
    }

    if (this.scale <= 1 || !this.image.classList.contains("panning")) return;
    const deltaX = event.clientX - this.panStart.x;
    const deltaY = event.clientY - this.panStart.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) this.hasPanned = true;
    this.translateX = this.panStart.originX + deltaX / this.scale;
    this.translateY = this.panStart.originY + deltaY / this.scale;
    this.clampTranslation();
    this.applyTransform();
  }

  private onPointerUp(event: PointerEvent) {
    if (!this.image) return;
    if (this.image.hasPointerCapture(event.pointerId)) {
      this.image.releasePointerCapture(event.pointerId);
    }
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.pinchStartDistance = 0;
    if (this.pointers.size === 0) this.image.classList.remove("panning");
  }

  private clampTranslation() {
    if (!this.image || !this.stage) return;
    const stageRect = this.stage.getBoundingClientRect();
    const width = this.image.offsetWidth;
    const height = this.image.offsetHeight;
    if (!stageRect.width || !stageRect.height || !width || !height) {
      this.translateX = 0;
      this.translateY = 0;
      return;
    }
    const maxX = Math.max(0, (width * this.scale - stageRect.width) / 2) / this.scale;
    const maxY = Math.max(0, (height * this.scale - stageRect.height) / 2) / this.scale;
    this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
  }

  private applyTransform() {
    if (!this.image) return;
    this.image.style.transform =
      this.scale === 1
        ? ""
        : `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
    this.image.classList.toggle("zoomed", this.scale > 1);
  }

  private resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.hasPanned = false;
    this.pointers.clear();
    this.pinchStartDistance = 0;
    if (this.image) {
      this.image.style.transform = "";
      this.image.classList.remove("zoomed", "panning");
    }
  }

  cleanupImageHandlers() {
    this.images.forEach((img) => {
      const handler = this.clickHandlers.get(img);
      if (handler) {
        img.removeEventListener("click", handler);
        this.clickHandlers.delete(img);
      }
      img.classList.remove("lightbox-target");
    });
    this.images = [];
  }
}

const lightbox = new ImageLightbox();

lightbox.init();
document.addEventListener("astro:page-load", () => lightbox.init());
document.addEventListener("astro:before-swap", () => {
  lightbox.close();
  lightbox.cleanupImageHandlers();
});
