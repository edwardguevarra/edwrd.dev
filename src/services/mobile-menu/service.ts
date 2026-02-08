import type { MobileMenuElements } from "./types";
import type { MobileMenuService } from "../../types/shared.types";
import { MOBILE_MENU_CLOSE_DELAY_MS } from "./config";
import { createLogger } from "../../utils/logger";
import {
  ServiceInitializationError,
  DOMElementNotFoundError,
} from "../../errors/types";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const isFocusable = (element: Element): boolean => {
  if (!element.matches(FOCUSABLE_SELECTOR)) {
    return false;
  }

  const htmlElement = element as HTMLElement;
  const interactiveElement = element as
    | HTMLInputElement
    | HTMLButtonElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | HTMLAnchorElement;
  if (
    "disabled" in interactiveElement &&
    (interactiveElement as { disabled?: boolean }).disabled
  ) {
    return false;
  }

  if (
    htmlElement.hidden ||
    htmlElement.getAttribute("aria-hidden") === "true"
  ) {
    return false;
  }

  return true;
};

export function createMobileMenuService(
  elements: MobileMenuElements
): MobileMenuService {
  const logger = createLogger("MobileMenuService");
  const {
    menuButton,
    mobileMenu,
    mobileMenuBackdrop,
    menuIcon,
    closeIcon,
    mobileTalkButton,
  } = elements;

  if (!menuButton) {
    throw new DOMElementNotFoundError("menuButton");
  }

  if (!mobileMenu) {
    throw new DOMElementNotFoundError("mobileMenu");
  }

  if (!mobileMenuBackdrop) {
    throw new DOMElementNotFoundError("mobileMenuBackdrop");
  }

  if (!menuIcon) {
    throw new DOMElementNotFoundError("menuIcon");
  }

  if (!closeIcon) {
    throw new DOMElementNotFoundError("closeIcon");
  }

  if (!mobileTalkButton) {
    logger.warn("Optional mobileTalkButton not provided");
  }

  logger.info("Service created");

  let previouslyFocusedElement: HTMLElement | null = null;
  let closeTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let skipFocusRestore = false;

  const handleNavLinkClick = () => {
    skipFocusRestore = true;
    close();
  };

  const handleMobileTalkButtonClick = () => {
    skipFocusRestore = true;
    close();
  };

  const isMenuOpen = (): boolean => !mobileMenu.classList.contains("hidden");

  const getFocusableElements = (): HTMLElement[] => {
    const allElements = Array.from(
      mobileMenu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    return allElements.filter(isFocusable);
  };

  const trapFocus = (event: KeyboardEvent) => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      mobileMenu.focus();
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;

    if (!activeElement || !mobileMenu.contains(activeElement)) {
      const firstElement = focusableElements[0];
      event.preventDefault();
      firstElement.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const attachEventListeners = () => {
    try {
      menuButton.addEventListener("click", handleMenuToggle);
      mobileMenuBackdrop.addEventListener("click", close);

      const mobileNavLinks = mobileMenu.querySelectorAll(".nav-link");
      mobileNavLinks.forEach((link) => {
        link.addEventListener("click", handleNavLinkClick);
      });

      mobileTalkButton?.addEventListener("click", handleMobileTalkButtonClick);
      document.addEventListener("keydown", handleKeyDown);
      logger.info("Event listeners attached");
    } catch (error) {
      logger.error("Failed to attach event listeners", { error });
      throw new ServiceInitializationError(
        "MobileMenuService",
        "Failed to attach event listeners",
        error
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isMenuOpen()) {
      return;
    }

    const focusableElements = getFocusableElements();

    if (event.key === "Escape") {
      event.preventDefault?.();
      close();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }

    if (focusableElements.length === 0) {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault?.();

      const currentIndex = focusableElements.findIndex(
        (element) => element === activeElement
      );

      let nextIndex: number;

      if (event.key === "ArrowDown") {
        nextIndex =
          currentIndex === -1 || currentIndex === focusableElements.length - 1
            ? 0
            : currentIndex + 1;
      } else {
        nextIndex =
          currentIndex === -1 || currentIndex === 0
            ? focusableElements.length - 1
            : currentIndex - 1;
      }

      focusableElements[nextIndex].focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault?.();
      focusableElements[0].focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault?.();
      focusableElements[focusableElements.length - 1].focus();
      return;
    }

    if (event.key === "Enter" && activeElement instanceof HTMLElement) {
      if (activeElement.tagName === "A" || activeElement.tagName === "BUTTON") {
        activeElement.click();
      }
    }
  };

  const handleMenuToggle = () => {
    if (!isMenuOpen()) {
      open();
    } else {
      close();
    }
  };

  const open = () => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = null;
    }

    const activeElement = document.activeElement as HTMLElement | null;

    previouslyFocusedElement =
      activeElement && mobileMenu.contains(activeElement)
        ? null
        : activeElement;

    mobileMenuBackdrop.classList.remove("hidden");
    mobileMenu.classList.remove("hidden");
    menuIcon.classList.add("hidden");
    closeIcon.classList.remove("hidden");

    menuButton.setAttribute("aria-expanded", "true");
    mobileMenuBackdrop.setAttribute("aria-hidden", "false");
    mobileMenu.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      mobileMenuBackdrop.classList.add("mobile-menu-backdrop-open");
      mobileMenu.classList.add("mobile-menu-open");
    });

    const [firstFocusableElement] = getFocusableElements();
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      mobileMenu.focus();
    }

    document.body.style.overflow = "hidden";
    skipFocusRestore = false;
  };

  const close = () => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
    }

    mobileMenuBackdrop.classList.remove("mobile-menu-backdrop-open");
    mobileMenu.classList.remove("mobile-menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    mobileMenuBackdrop.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("aria-hidden", "true");

    closeTimeoutId = setTimeout(() => {
      mobileMenuBackdrop.classList.add("hidden");
      mobileMenu.classList.add("hidden");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
      document.body.style.overflow = "";

      if (!skipFocusRestore) {
        const shouldRestorePreviousFocus =
          previouslyFocusedElement !== null &&
          previouslyFocusedElement !== document.body &&
          document.contains(previouslyFocusedElement);
        const focusTarget = shouldRestorePreviousFocus
          ? previouslyFocusedElement
          : menuButton;
        if (focusTarget) {
          focusTarget.focus();
        }
      }
      previouslyFocusedElement = null;
      closeTimeoutId = null;
      skipFocusRestore = false;
    }, MOBILE_MENU_CLOSE_DELAY_MS);
  };

  const initialize = () => {
    try {
      logger.info("Initializing service");
      attachEventListeners();
      logger.info("Service initialized");
    } catch (error) {
      logger.error("Initialization failed", { error });
      throw error;
    }
  };

  const destroy = () => {
    try {
      menuButton.removeEventListener("click", handleMenuToggle);
      mobileMenuBackdrop.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeyDown);

      const mobileNavLinks = mobileMenu.querySelectorAll(".nav-link");
      mobileNavLinks.forEach((link) => {
        link.removeEventListener("click", handleNavLinkClick);
      });

      mobileTalkButton?.removeEventListener(
        "click",
        handleMobileTalkButtonClick
      );
      if (closeTimeoutId) {
        clearTimeout(closeTimeoutId);
        closeTimeoutId = null;
      }
      document.body.style.overflow = "";
      logger.info("Service destroyed");
    } catch (error) {
      logger.error("Cleanup failed", { error });
    }
  };

  return {
    initialize,
    destroy,
    open,
    close,
  };
}
