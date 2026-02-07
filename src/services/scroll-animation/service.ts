import type { ScrollAnimationServiceConfig } from "./types";
import type { ScrollAnimationService } from "../../types/shared.types";
import { createLogger } from "../../utils/logger";
import { ServiceInitializationError, ObserverError } from "../../errors/types";

export function createScrollAnimationService(
  config: ScrollAnimationServiceConfig
): ScrollAnimationService {
  const logger = createLogger("ScrollAnimationService");
  let observer: IntersectionObserver | null = null;
  const { animatedElements } = config.elements;

  if (!animatedElements || animatedElements.length === 0) {
    logger.warn(
      "No animated elements provided, service will not animate anything"
    );
  } else {
    logger.info("Service created", {
      elementsCount: animatedElements.length,
    });
  }

  const defaultConfig = {
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.1,
    animateClass: "animate-on-scroll",
  };

  const finalConfig = { ...defaultConfig, ...config };

  const handleReducedMotion = (): boolean => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      return false;
    }

    if (!animatedElements || animatedElements.length === 0) {
      logger.info("Reduced motion preferred, no elements to animate");
      return true;
    }

    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    logger.info("Reduced motion preferred, animation disabled");
    return true;
  };

  const setupObserver = () => {
    observer = new IntersectionObserver(
      (entries) => {
        /* v8 ignore start */
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(finalConfig.animateClass);
            observer?.unobserve(entry.target);
          }
        });
        /* v8 ignore end */
      },
      {
        root: null,
        rootMargin: finalConfig.rootMargin,
        threshold: finalConfig.threshold,
      }
    );
  };

  const observeElements = () => {
    if (!animatedElements || animatedElements.length === 0) {
      return;
    }

    animatedElements.forEach((el) => {
      try {
        observer!.observe(el);
      } catch (error) {
        throw new ObserverError("observe", el, error);
      }
    });
  };

  const checkInitialView = () => {
    if (!animatedElements || animatedElements.length === 0) {
      return;
    }

    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
      if (isInViewport) {
        el.classList.add(finalConfig.animateClass);
        observer?.unobserve(el);
      }
    });
  };

  const initialize = () => {
    try {
      logger.info("Initializing service");

      if (handleReducedMotion()) {
        return;
      }

      setupObserver();
      observeElements();

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkInitialView);
      } else {
        checkInitialView();
      }

      logger.info("Service initialized");
    } catch (error) {
      logger.error("Initialization failed", { error });
      throw new ServiceInitializationError(
        "ScrollAnimationService",
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
