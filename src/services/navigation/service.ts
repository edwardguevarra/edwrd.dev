import type { NavigationServiceConfig } from "./types";
import type { NavigationService } from "../../types/shared.types";
import {
  isBlogPage,
  getDefaultActiveSection,
  getActiveLinkClasses,
  shouldSkipBlogHighlight,
  SECTION_IDS,
} from "./config";
import { createLogger } from "../../utils/logger";
import { ServiceInitializationError, ObserverError } from "../../errors/types";

export function createNavigationService(
  config: NavigationServiceConfig
): NavigationService {
  const logger = createLogger("NavigationService");
  let observer: IntersectionObserver | null = null;
  const { sections, navLinks } = config.elements;
  const intersectingSections = new Map<Element, number>();

  if (!navLinks || navLinks.length === 0) {
    throw new ServiceInitializationError(
      "NavigationService",
      "navLinks must be provided"
    );
  }

  if (!sections || sections.length === 0) {
    logger.warn(
      "No sections provided, service will only handle nav link highlighting"
    );
  }

  logger.info("Service created", {
    sectionsCount: sections?.length ?? 0,
    navLinksCount: navLinks.length,
  });

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
    if (!sections || sections.length === 0) return;

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

    if (!sections || sections.length === 0) {
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
    try {
      logger.info("Initializing service");
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
        logger.info("Initialized on blog page");
        return;
      }

      checkInitialActiveSection();
      setupObserver();

      if (observer && sections && sections.length > 0) {
        sections.forEach((section) => {
          try {
            observer!.observe(section);
          } catch (error) {
            throw new ObserverError("observe", section, error);
          }
        });
        logger.info("Observer initialized for all sections");
      }
    } catch (error) {
      logger.error("Initialization failed", { error });
      throw new ServiceInitializationError(
        "NavigationService",
        "Failed to initialize",
        error
      );
    }
  };

  const destroy = () => {
    try {
      if (observer) {
        observer.disconnect();
      }
      intersectingSections.clear();
      logger.info("Service destroyed");
    } catch (error) {
      logger.error("Cleanup failed", { error });
    }
  };

  return {
    initialize,
    destroy,
  };
}
