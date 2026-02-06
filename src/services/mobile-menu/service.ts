import type { MobileMenuElements } from "./types";
import type { MobileMenuService } from "../../types/shared.types";

export function createMobileMenuService(
  elements: MobileMenuElements
): MobileMenuService {
  const {
    menuButton,
    mobileMenu,
    mobileMenuBackdrop,
    menuIcon,
    closeIcon,
    mobileTalkButton,
  } = elements;

  const attachEventListeners = () => {
    menuButton.addEventListener("click", handleMenuToggle);
    mobileMenuBackdrop.addEventListener("click", close);

    const mobileNavLinks = mobileMenu.querySelectorAll(".nav-link");
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", close);
    });

    mobileTalkButton?.addEventListener("click", close);
    document.addEventListener("keydown", handleKeyDown);
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
    }, 300);
  };

  const initialize = () => {
    attachEventListeners();
  };

  const destroy = () => {
    menuButton.removeEventListener("click", handleMenuToggle);
    mobileMenuBackdrop.removeEventListener("click", close);
    document.removeEventListener("keydown", handleKeyDown);

    const mobileNavLinks = mobileMenu.querySelectorAll(".nav-link");
    mobileNavLinks.forEach((link) => {
      link.removeEventListener("click", close);
    });

    mobileTalkButton?.removeEventListener("click", close);
  };

  return {
    initialize,
    destroy,
    open,
    close,
  };
}
