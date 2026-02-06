import { describe, it, expect, vi } from "vitest";
import { createMobileMenuService } from "../service";
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
});
