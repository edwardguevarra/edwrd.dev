export class NavigationManager {
  private observer: IntersectionObserver | null = null;
  private sections: NodeListOf<Element> | null = null;
  private navLinks: NodeListOf<Element> | null = null;
  private intersectingSections = new Map<Element, number>();

  constructor() {
    this.initializeElements();
    this.setupObserver();
  }

  private initializeElements() {
    this.sections = document.querySelectorAll("section[id]");
    this.navLinks = document.querySelectorAll(".nav-link");
  }

  private setupObserver() {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      observerOptions
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.intersectingSections.set(entry.target, entry.intersectionRatio);
      } else {
        this.intersectingSections.delete(entry.target);
      }
    });

    this.updateActiveSection();
  }

  private updateActiveSection() {
    if (this.intersectingSections.size > 0) {
      let maxRatio = 0;
      let activeSection: Element | null = null;

      this.intersectingSections.forEach((ratio, section) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeSection = section;
        }
      });

      if (activeSection && (activeSection as HTMLElement).id) {
        this.updateActiveNav((activeSection as HTMLElement).id);
      }
    } else {
      // If no sections are intersecting, check scroll position
      const scrollPosition = window.scrollY;
      if (scrollPosition < 100) {
        // Near top of page, default to first section (about)
        this.updateActiveNav("about");
      }
    }
  }

  private updateActiveNav(activeSectionId: string) {
    if (!this.navLinks) return;

    this.navLinks.forEach((link) => {
      const linkSection = link.getAttribute("data-section");
      if (linkSection === activeSectionId) {
        link.classList.add("text-brand-lime");
        link.classList.remove("text-white");
      } else {
        const isBlogPage = window.location.pathname.startsWith("/blog");
        // Don't override blog link styling if we're on blog page
        if (linkSection === "blog" && isBlogPage) {
          return;
        }
        link.classList.remove("text-brand-lime");
        link.classList.add("text-white");
      }
    });
  }

  private checkInitialActiveSection() {
    // Don't run intersection observer logic on blog pages
    const isBlogPage = window.location.pathname.startsWith("/blog");
    if (isBlogPage) {
      return;
    }

    const scrollPosition = window.scrollY;
    if (scrollPosition < 100) {
      this.updateActiveNav("about");
    } else {
      // Find the first section that's in view
      if (this.sections) {
        this.sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= 0) {
            const sectionId = (section as HTMLElement).id;
            if (sectionId) {
              this.updateActiveNav(sectionId);
            }
          }
        });
      }
    }
  }

  public initialize() {
    const isBlogPage = window.location.pathname.startsWith("/blog");

    // If on blog page, highlight blog link
    if (isBlogPage) {
      if (this.navLinks) {
        this.navLinks.forEach((link) => {
          const linkSection = link.getAttribute("data-section");
          if (linkSection === "blog") {
            link.classList.add("text-brand-lime");
            link.classList.remove("text-white");
          } else {
            link.classList.remove("text-brand-lime");
            link.classList.add("text-white");
          }
        });
      }
      return; // Don't set up intersection observer on blog pages
    }

    // Set initial active state and observe sections
    this.checkInitialActiveSection();
    if (this.sections && this.observer) {
      this.sections.forEach((section) => {
        const sectionId = (section as HTMLElement).id;
        if (sectionId) {
          this.observer!.observe(section);
        }
      });
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.intersectingSections.clear();
  }
}
