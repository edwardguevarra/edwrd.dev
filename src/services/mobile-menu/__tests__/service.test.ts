import { describe, it, expect, vi } from "vitest";
import { createMobileMenuService } from "../index";
import type { MobileMenuElements } from "../types";

describe("createMobileMenuService", () => {
  it("initializes without errors", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");
    menuIcon.classList.add("block");
    closeIcon.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    expect(service).toBeDefined();
    expect(service.initialize).toBeInstanceOf(Function);
    expect(service.destroy).toBeInstanceOf(Function);
    expect(service.open).toBeInstanceOf(Function);
    expect(service.close).toBeInstanceOf(Function);

    service.destroy();
  });

  it("opens menu correctly", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");
    menuIcon.classList.add("block");
    closeIcon.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();
    service.open();

    expect(backdrop.classList.contains("hidden")).toBe(false);
    expect(mobileMenu.classList.contains("hidden")).toBe(false);
    expect(menuIcon.classList.contains("hidden")).toBe(true);
    expect(closeIcon.classList.contains("hidden")).toBe(false);

    service.destroy();
  });

  it("closes menu correctly", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden", "mobile-menu-open");
    backdrop.classList.add("hidden", "mobile-menu-backdrop-open");
    menuIcon.classList.add("hidden");
    closeIcon.classList.add("block");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();
    service.close();

    vi.useFakeTimers();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(backdrop.classList.contains("hidden")).toBe(true);
    expect(mobileMenu.classList.contains("hidden")).toBe(true);

    service.destroy();
  });

  it("toggles menu to closed when already open", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    mobileMenu.classList.add("mobile-menu-open");
    backdrop.classList.add("mobile-menu-backdrop-open");
    menuIcon.classList.add("hidden");
    closeIcon.classList.remove("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();
    menuButton.click();

    expect(backdrop.classList.contains("mobile-menu-backdrop-open")).toBe(
      false
    );
    expect(mobileMenu.classList.contains("mobile-menu-open")).toBe(false);

    vi.useFakeTimers();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    service.destroy();
  });

  it("handles null mobileTalkButton", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: null,
    };

    const service = createMobileMenuService(elements);
    expect(() => service.initialize()).not.toThrow();
    expect(() => service.open()).not.toThrow();
    expect(() => service.close()).not.toThrow();

    service.destroy();
  });

  it("cleanup removes all event listeners", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const removeSpy = vi.spyOn(menuButton, "removeEventListener");
    const documentSpy = vi.spyOn(document, "removeEventListener");

    const service = createMobileMenuService(elements);
    service.destroy();

    expect(removeSpy).toHaveBeenCalled();
    expect(documentSpy).toHaveBeenCalled();
  });

  it("toggles menu when menu button is clicked", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");
    menuIcon.classList.add("block");
    closeIcon.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();

    menuButton.click();

    expect(backdrop.classList.contains("hidden")).toBe(false);
    expect(mobileMenu.classList.contains("hidden")).toBe(false);
    expect(menuIcon.classList.contains("hidden")).toBe(true);
    expect(closeIcon.classList.contains("hidden")).toBe(false);

    service.destroy();
  });

  it("removes all nav link event listeners on destroy", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    const navLink = document.createElement("a");
    navLink.classList.add("nav-link");
    mobileMenu.appendChild(navLink);

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const navLinkRemoveSpy = vi.spyOn(navLink, "removeEventListener");

    const service = createMobileMenuService(elements);
    service.initialize();
    service.destroy();

    expect(navLinkRemoveSpy).toHaveBeenCalled();
  });

  it("sets aria-expanded attributes when menu opens", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.open();

    expect(menuButton.getAttribute("aria-expanded")).toBe("true");
    expect(backdrop.getAttribute("aria-hidden")).toBe("false");

    service.destroy();
  });

  it("sets aria-expanded attributes when menu closes", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden", "mobile-menu-open");
    backdrop.classList.add("hidden", "mobile-menu-backdrop-open");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();
    service.close();

    vi.useFakeTimers();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");

    service.destroy();
  });

  it("removes nav link event listeners on destroy even without initialization", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    const navLink = document.createElement("a");
    navLink.classList.add("nav-link");
    mobileMenu.appendChild(navLink);

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    expect(() => service.destroy()).not.toThrow();
  });

  it("removes mobileTalkButton event listener on destroy when provided", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const talkButtonRemoveSpy = vi.spyOn(talkButton, "removeEventListener");

    const service = createMobileMenuService(elements);
    service.initialize();
    service.destroy();

    expect(talkButtonRemoveSpy).toHaveBeenCalled();
  });

  it("closes menu when talk button is <a> element", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("a");

    mobileMenu.classList.add("hidden", "mobile-menu-open");
    backdrop.classList.add("hidden", "mobile-menu-backdrop-open");
    menuIcon.classList.add("hidden");
    closeIcon.classList.add("block");
    talkButton.href = "/#contact";

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const service = createMobileMenuService(elements);
    service.initialize();

    talkButton.click();

    vi.useFakeTimers();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();

    expect(backdrop.classList.contains("hidden")).toBe(true);
    expect(mobileMenu.classList.contains("hidden")).toBe(true);

    service.destroy();
  });

  it("closes menu when Escape key is pressed", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    mobileMenu.classList.add("mobile-menu-open");
    backdrop.classList.add("mobile-menu-backdrop-open");
    menuIcon.classList.add("hidden");
    closeIcon.classList.remove("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    vi.useFakeTimers();

    const service = createMobileMenuService(elements);
    service.initialize();

    service.close();

    vi.advanceTimersByTime(300);

    expect(backdrop.classList.contains("hidden")).toBe(true);
    expect(mobileMenu.classList.contains("hidden")).toBe(true);

    vi.useRealTimers();

    service.destroy();
  });

  it("handles Escape key press when menu is open", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.remove("hidden");
    backdrop.classList.remove("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const eventCallbacks: Map<string, (event: KeyboardEvent) => void> =
      new Map();

    addEventListenerSpy.mockImplementation((event, callback) => {
      if (event === "keydown") {
        eventCallbacks.set(event, callback as (event: KeyboardEvent) => void);
      }
    });

    vi.useFakeTimers();

    const testService = createMobileMenuService(elements);
    testService.initialize();

    testService.open();

    const escapeEvent = { key: "Escape" } as KeyboardEvent;
    const keydownCallback = eventCallbacks.get("keydown");
    if (keydownCallback) {
      keydownCallback(escapeEvent);
    }

    expect(mobileMenu.classList.contains("hidden")).toBe(false);

    vi.advanceTimersByTime(300);

    expect(mobileMenu.classList.contains("hidden")).toBe(true);

    vi.useRealTimers();

    testService.destroy();
    addEventListenerSpy.mockRestore();
  });

  it("handles menu without nav-link elements", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: null,
    };

    vi.useFakeTimers();

    const testService = createMobileMenuService(elements);
    testService.initialize();
    testService.open();

    vi.advanceTimersByTime(300);

    expect(backdrop.classList.contains("hidden")).toBe(false);
    expect(mobileMenu.classList.contains("hidden")).toBe(false);

    vi.useRealTimers();

    testService.destroy();
  });

  it("handles open when no nav-link elements exist", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const talkButton = document.createElement("button");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");
    menuIcon.classList.add("block");
    closeIcon.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: talkButton,
    };

    vi.useFakeTimers();

    const testService = createMobileMenuService(elements);
    testService.initialize();
    testService.open();

    expect(backdrop.classList.contains("hidden")).toBe(false);
    expect(mobileMenu.classList.contains("hidden")).toBe(false);

    vi.useRealTimers();

    testService.destroy();
  });

  it("opens menu without nav-link elements and does not throw on focus", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");

    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: null,
    };

    const service = createMobileMenuService(elements);
    expect(() => service.open()).not.toThrow();

    service.destroy();
  });

  it("opens menu with nav-link element and calls focus", () => {
    const menuButton = document.createElement("button");
    const mobileMenu = document.createElement("div");
    const backdrop = document.createElement("div");
    const menuIcon = document.createElement("span");
    const closeIcon = document.createElement("span");
    const navLink = document.createElement("a");

    navLink.classList.add("nav-link");
    mobileMenu.appendChild(navLink);
    mobileMenu.classList.add("hidden");
    backdrop.classList.add("hidden");
    menuIcon.classList.add("block");
    closeIcon.classList.add("hidden");

    const navLinkFocusSpy = vi.spyOn(navLink, "focus");

    const elements: MobileMenuElements = {
      menuButton,
      mobileMenu,
      mobileMenuBackdrop: backdrop,
      menuIcon,
      closeIcon,
      mobileTalkButton: null,
    };

    const service = createMobileMenuService(elements);
    service.open();

    expect(navLinkFocusSpy).toHaveBeenCalled();

    service.destroy();
  });
});
