import type { NavigationServiceConfig } from "./types";
import type { NavigationService } from "../../types/shared.types";

export function createNavigationService(
  config: NavigationServiceConfig
): NavigationService {
  let observer: IntersectionObserver | null = null;
  const { sections, navLinks } = config.elements;
  const intersectingSections = new Map<Element, number>();

  const defaultConfig = {
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0,
  };

  const finalConfig = { ...defaultConfig, ...config };

  const setupObserver = () => {
    observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: finalConfig.rootMargin,
      threshold: finalConfig.threshold,
    });
  };

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        intersectingSections.set(entry.target, entry.intersectionRatio);
      } else {
        intersectingSections.delete(entry.target);
      }
    });

    updateActiveSection();
  };

  const updateActiveSection = () => {
    if (intersectingSections.size > 0) {
      let maxRatio = 0;
      let activeSection: Element | null = null;

      intersectingSections.forEach((ratio, section) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeSection = section;
        }
      });

      if (activeSection && (activeSection as HTMLElement).id) {
        updateActiveNav((activeSection as HTMLElement).id);
      }
    } else {
      const scrollPosition = window.scrollY;
      if (scrollPosition < 100) {
        updateActiveNav("about");
      }
    }
  };

  const updateActiveNav = (activeSectionId: string) => {
    navLinks.forEach((link) => {
      const linkSection = link.getAttribute("data-section");
      if (linkSection === activeSectionId) {
        link.classList.add("text-brand-lime");
        link.classList.remove("text-white");
      } else {
        const isBlogPage = window.location.pathname.startsWith("/blog");
        if (linkSection === "blog" && isBlogPage) {
          return;
        }
        link.classList.remove("text-brand-lime");
        link.classList.add("text-white");
      }
    });
  };

  const checkInitialActiveSection = () => {
    const isBlogPage = window.location.pathname.startsWith("/blog");
    if (isBlogPage) {
      return;
    }

    const scrollPosition = window.scrollY;
    if (scrollPosition < 100) {
      updateActiveNav("about");
    } else {
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= 0) {
          const sectionId = (section as HTMLElement).id;
          if (sectionId) {
            updateActiveNav(sectionId);
          }
        }
      });
    }
  };

  const initialize = () => {
    const isBlogPage = window.location.pathname.startsWith("/blog");

    if (isBlogPage) {
      navLinks.forEach((link) => {
        const linkSection = link.getAttribute("data-section");
        if (linkSection === "blog") {
          link.classList.add("text-brand-lime");
          link.classList.remove("text-white");
        } else {
          link.classList.remove("text-brand-lime");
          link.classList.add("text-white");
        }
      });
      return;
    }

    checkInitialActiveSection();
    setupObserver();

    if (observer) {
      sections.forEach((section) => {
        const sectionId = (section as HTMLElement).id;
        if (sectionId) {
          observer!.observe(section);
        }
      });
    }
  };

  const destroy = () => {
    if (observer) {
      observer.disconnect();
    }
    intersectingSections.clear();
  };

  return {
    initialize,
    destroy,
  };
}
