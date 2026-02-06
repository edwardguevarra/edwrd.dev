import type { NavigationServiceConfig } from "./types";
import type { NavigationService } from "../../types/shared.types";
import {
  isBlogPage,
  getDefaultActiveSection,
  getActiveLinkClasses,
  shouldSkipBlogHighlight,
  SECTION_IDS,
} from "./config";

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
        updateActiveNav(getDefaultActiveSection());
      }
    }
  };

  const updateActiveNav = (activeSectionId: string) => {
    const isCurrentPageBlog = isBlogPage(window.location.pathname);
    navLinks.forEach((link) => {
      const linkSection = link.getAttribute("data-section");
      if (linkSection === activeSectionId) {
        link.classList.add(getActiveLinkClasses(true));
        link.classList.remove(getActiveLinkClasses(false));
      } else {
        if (shouldSkipBlogHighlight(linkSection || "", isCurrentPageBlog)) {
          return;
        }
        link.classList.remove(getActiveLinkClasses(true));
        link.classList.add(getActiveLinkClasses(false));
      }
    });
  };

  const checkInitialActiveSection = () => {
    if (isBlogPage(window.location.pathname)) {
      return;
    }

    const scrollPosition = window.scrollY;
    if (scrollPosition < 100) {
      updateActiveNav(getDefaultActiveSection());
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
    const isCurrentPageBlog = isBlogPage(window.location.pathname);

    if (isCurrentPageBlog) {
      navLinks.forEach((link) => {
        const linkSection = link.getAttribute("data-section");
        if (linkSection === SECTION_IDS.BLOG) {
          link.classList.add(getActiveLinkClasses(true));
          link.classList.remove(getActiveLinkClasses(false));
        } else {
          link.classList.remove(getActiveLinkClasses(true));
          link.classList.add(getActiveLinkClasses(false));
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
