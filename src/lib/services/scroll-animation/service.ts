import type { ScrollAnimationServiceConfig } from "./types";
import type { ScrollAnimationService } from "../../types/shared.types";

export function createScrollAnimationService(
  config: ScrollAnimationServiceConfig
): ScrollAnimationService {
  let observer: IntersectionObserver | null = null;
  const { animatedElements } = config.elements;

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

    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
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
    animatedElements.forEach((el) => {
      observer!.observe(el);
    });
  };

  const checkInitialView = () => {
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        el.classList.add(finalConfig.animateClass);
        observer?.unobserve(el);
      }
    });
  };

  const initialize = () => {
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
  };

  const destroy = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  return {
    initialize,
    destroy,
  };
}
