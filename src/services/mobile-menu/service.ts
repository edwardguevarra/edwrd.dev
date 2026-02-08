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

  const isMenuOpen = (): boolean => !mobileMenu.classList.contains("hidden");

  const getFocusableElements = (): HTMLElement[] =>
    Array.from(mobileMenu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

  const trapFocus = (event: KeyboardEvent) => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      mobileMenu.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

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
        link.addEventListener("click", close);
      });

      mobileTalkButton?.addEventListener("click", close);
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

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event);
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

    previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

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

    document.body.style.overflow = "hidden";

    const [firstFocusableElement] = getFocusableElements();
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      mobileMenu.focus();
    }
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

      const shouldRestorePreviousFocus =
        previouslyFocusedElement !== null &&
        previouslyFocusedElement !== document.body &&
        document.contains(previouslyFocusedElement);
      const focusTarget = shouldRestorePreviousFocus
        ? previouslyFocusedElement
        : menuButton;
      focusTarget.focus();
      previouslyFocusedElement = null;
      closeTimeoutId = null;
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
        link.removeEventListener("click", close);
      });

      mobileTalkButton?.removeEventListener("click", close);
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
