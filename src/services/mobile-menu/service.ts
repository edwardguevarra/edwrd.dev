import type { MobileMenuElements } from "./types";
import type { MobileMenuService } from "../../types/shared.types";
import { MOBILE_MENU_CLOSE_DELAY_MS } from "./config";
import { createLogger } from "../../utils/logger";
import {
  ServiceInitializationError,
  DOMElementNotFoundError,
} from "../../errors/types";

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
    if (event.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
      close();
    }
  };

  const handleMenuToggle = () => {
    const isHidden = mobileMenu.classList.contains("hidden");
    if (isHidden) {
      open();
    } else {
      close();
    }
  };

  const open = () => {
    mobileMenuBackdrop.classList.remove("hidden");
    mobileMenu.classList.remove("hidden");
    menuIcon.classList.add("hidden");
    closeIcon.classList.remove("hidden");

    menuButton.setAttribute("aria-expanded", "true");
    mobileMenuBackdrop.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      mobileMenuBackdrop.classList.add("mobile-menu-backdrop-open");
      mobileMenu.classList.add("mobile-menu-open");
    });

    document.body.style.overflow = "hidden";

    const firstNavLink = mobileMenu.querySelector(".nav-link") as HTMLElement;
    firstNavLink?.focus();
  };

  const close = () => {
    mobileMenuBackdrop.classList.remove("mobile-menu-backdrop-open");
    mobileMenu.classList.remove("mobile-menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    mobileMenuBackdrop.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      mobileMenuBackdrop.classList.add("hidden");
      mobileMenu.classList.add("hidden");
      menuIcon.classList.remove("hidden");
      closeIcon.classList.add("hidden");
      document.body.style.overflow = "";
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
