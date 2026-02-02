export class MobileMenuController {
  private menuButton: HTMLElement | null = null;
  private mobileMenu: HTMLElement | null = null;
  private mobileMenuBackdrop: HTMLElement | null = null;
  private menuIcon: HTMLElement | null = null;
  private closeIcon: HTMLElement | null = null;
  private mobileMenuButtonWrapper: HTMLElement | null = null;
  private mobileTalkButton: HTMLElement | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements() {
    this.menuButton = document.getElementById("mobile-menu-button");
    this.mobileMenu = document.getElementById("mobile-menu");
    this.mobileMenuBackdrop = document.getElementById("mobile-menu-backdrop");
    this.menuIcon = document.getElementById("menu-icon");
    this.closeIcon = document.getElementById("close-icon");
    this.mobileMenuButtonWrapper = document.getElementById(
      "mobile-menu-button-wrapper"
    );
    this.mobileTalkButton =
      this.mobileMenuButtonWrapper?.querySelector("button") || null;
  }

  private attachEventListeners() {
    // Main menu button toggle
    this.menuButton?.addEventListener(
      "click",
      this.handleMenuToggle.bind(this)
    );

    // Close menu when clicking backdrop
    this.mobileMenuBackdrop?.addEventListener(
      "click",
      this.closeMobileMenu.bind(this)
    );

    // Close mobile menu when clicking navigation links
    const mobileNavLinks = this.mobileMenu?.querySelectorAll(".nav-link");
    mobileNavLinks?.forEach((link) => {
      link.addEventListener("click", this.closeMobileMenu.bind(this));
    });

    // Close mobile menu when clicking "Let's Talk" button
    this.mobileTalkButton?.addEventListener(
      "click",
      this.closeMobileMenu.bind(this)
    );

    // Handle escape key
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key === "Escape" &&
      !this.mobileMenu?.classList.contains("hidden")
    ) {
      this.closeMobileMenu();
    }
  };

  private handleMenuToggle = () => {
    const isHidden = this.mobileMenu?.classList.contains("hidden");

    if (isHidden) {
      this.openMobileMenu();
    } else {
      this.closeMobileMenu();
    }
  };

  public openMobileMenu = () => {
    if (
      !this.mobileMenuBackdrop ||
      !this.mobileMenu ||
      !this.menuIcon ||
      !this.closeIcon
    ) {
      return;
    }

    this.mobileMenuBackdrop.classList.remove("hidden");
    this.mobileMenu.classList.remove("hidden");
    this.menuIcon.classList.add("hidden");
    this.closeIcon.classList.remove("hidden");

    // Update ARIA attributes
    if (this.menuButton) this.menuButton.setAttribute("aria-expanded", "true");
    if (this.mobileMenuBackdrop)
      this.mobileMenuBackdrop.setAttribute("aria-hidden", "false");

    // Trigger animation by removing hidden class first, then adding open class
    requestAnimationFrame(() => {
      if (this.mobileMenuBackdrop)
        this.mobileMenuBackdrop.classList.add("mobile-menu-backdrop-open");
      if (this.mobileMenu) this.mobileMenu.classList.add("mobile-menu-open");
    });

    // Prevent body scroll when menu is open
    document.body.style.overflow = "hidden";

    // Focus management - focus the first navigation link
    const firstNavLink = this.mobileMenu.querySelector(
      ".nav-link"
    ) as HTMLElement;
    firstNavLink?.focus();
  };

  public closeMobileMenu = () => {
    if (
      !this.mobileMenuBackdrop ||
      !this.mobileMenu ||
      !this.menuIcon ||
      !this.closeIcon
    ) {
      return;
    }

    this.mobileMenuBackdrop.classList.remove("mobile-menu-backdrop-open");
    this.mobileMenu.classList.remove("mobile-menu-open");

    // Update ARIA attributes
    if (this.menuButton) this.menuButton.setAttribute("aria-expanded", "false");
    if (this.mobileMenuBackdrop)
      this.mobileMenuBackdrop.setAttribute("aria-hidden", "true");

    // Wait for animation to complete before hiding
    setTimeout(() => {
      if (this.mobileMenuBackdrop)
        this.mobileMenuBackdrop.classList.add("hidden");
      if (this.mobileMenu) this.mobileMenu.classList.add("hidden");
      if (this.menuIcon) this.menuIcon.classList.remove("hidden");
      if (this.closeIcon) this.closeIcon.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);
  };

  public destroy() {
    // Clean up event listeners
    this.menuButton?.removeEventListener("click", this.handleMenuToggle);
    this.mobileMenuBackdrop?.removeEventListener("click", this.closeMobileMenu);
    document.removeEventListener("keydown", this.handleKeyDown);

    // Remove navigation link listeners
    const mobileNavLinks = this.mobileMenu?.querySelectorAll(".nav-link");
    mobileNavLinks?.forEach((link) => {
      link.removeEventListener("click", this.closeMobileMenu);
    });

    this.mobileTalkButton?.removeEventListener("click", this.closeMobileMenu);
  }
}
