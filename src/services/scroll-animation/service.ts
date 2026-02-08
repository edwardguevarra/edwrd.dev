import type { ScrollAnimationServiceConfig } from "./types";
import type { ScrollAnimationService } from "../../types/shared.types";
import {
  SCROLL_ANIMATION_DEFAULT_ROOT_MARGIN,
  SCROLL_ANIMATION_DEFAULT_THRESHOLD,
  SCROLL_ANIMATION_DEFAULT_CLASS,
} from "./config";
import { createLogger } from "../../utils/logger";
import { ServiceInitializationError, ObserverError } from "../../errors/types";

export function createScrollAnimationService(
  config: ScrollAnimationServiceConfig
): ScrollAnimationService {
  const logger = createLogger("ScrollAnimationService");
  let observer: IntersectionObserver | null = null;
  let domContentLoadedListener: (() => void) | null = null;
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
    rootMargin: SCROLL_ANIMATION_DEFAULT_ROOT_MARGIN,
    threshold: SCROLL_ANIMATION_DEFAULT_THRESHOLD,
    animateClass: SCROLL_ANIMATION_DEFAULT_CLASS,
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(finalConfig.animateClass);
            observer?.unobserve(entry.target);
          }
        });
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
        domContentLoadedListener = checkInitialView;
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
      if (domContentLoadedListener) {
        document.removeEventListener(
          "DOMContentLoaded",
          domContentLoadedListener
        );
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
