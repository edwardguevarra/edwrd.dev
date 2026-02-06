export class ScrollAnimationManager {
  private observer: IntersectionObserver | null = null;
  private animatedElements: NodeListOf<HTMLElement> | null = null;
  private readonly observerOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px", // Trigger when element is 100px from bottom of viewport
    threshold: 0.1, // Trigger when 10% of element is visible
  };

  constructor() {
    this.initializeElements();
  }

  private initializeElements() {
    this.animatedElements =
      document.querySelectorAll<HTMLElement>("[data-animate]");
  }

  private handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      return false;
    }

    if (this.animatedElements) {
      this.animatedElements.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }
    return true;
  }

  private setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-on-scroll");
          this.observer?.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
  }

  private observeElements() {
    if (!this.animatedElements || !this.observer) {
      return;
    }

    this.animatedElements.forEach((el) => {
      this.observer!.observe(el);
    });
  }

  private checkInitialView() {
    if (!this.animatedElements) {
      return;
    }

    this.animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        el.classList.add("animate-on-scroll");
        this.observer?.unobserve(el);
      }
    });
  }

  public initialize() {
    if (this.handleReducedMotion()) {
      return;
    }

    this.setupObserver();
    this.observeElements();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.checkInitialView()
      );
    } else {
      this.checkInitialView();
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
