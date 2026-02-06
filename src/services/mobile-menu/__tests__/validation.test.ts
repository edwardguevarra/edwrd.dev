import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMobileMenuService } from "../service";
import type { MobileMenuElements } from "../types";
import { DOMElementNotFoundError } from "../../../errors/types";

describe("Mobile Menu Service Validation", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockElements = (): MobileMenuElements => ({
    menuButton: document.createElement("button"),
    mobileMenu: document.createElement("div"),
    mobileMenuBackdrop: document.createElement("div"),
    menuIcon: document.createElement("span"),
    closeIcon: document.createElement("span"),
    mobileTalkButton: null,
  });

  describe("required elements validation", () => {
    it("should throw DOMElementNotFoundError when menuButton is null", () => {
      const elements = {
        ...createMockElements(),
        menuButton: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: menuButton"
      );
    });

    it("should throw DOMElementNotFoundError when mobileMenu is null", () => {
      const elements = {
        ...createMockElements(),
        mobileMenu: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: mobileMenu"
      );
    });

    it("should throw DOMElementNotFoundError when mobileMenuBackdrop is null", () => {
      const elements = {
        ...createMockElements(),
        mobileMenuBackdrop: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: mobileMenuBackdrop"
      );
    });

    it("should throw DOMElementNotFoundError when menuIcon is null", () => {
      const elements = {
        ...createMockElements(),
        menuIcon: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: menuIcon"
      );
    });

    it("should throw DOMElementNotFoundError when closeIcon is null", () => {
      const elements = {
        ...createMockElements(),
        closeIcon: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: closeIcon"
      );
    });

    it("should create service with all required elements present", () => {
      const elements = createMockElements();

      const service = createMobileMenuService(elements);
      expect(service).toBeDefined();
      service.destroy();
    });
  });

  describe("optional elements handling", () => {
    it("should log warning when mobileTalkButton is null", () => {
      const elements = createMockElements();

      createMobileMenuService(elements);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("Optional mobileTalkButton")
        )
      );
      expect(hasWarning).toBe(true);
    });

    it("should not log warning when mobileTalkButton is provided", () => {
      const elements = {
        ...createMockElements(),
        mobileTalkButton: document.createElement("a"),
      };

      createMobileMenuService(elements);

      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("Optional mobileTalkButton")
        )
      );
      expect(hasWarning).toBe(false);
    });

    it("should create service with null mobileTalkButton", () => {
      const elements = createMockElements();

      const service = createMobileMenuService(elements);
      expect(service).toBeDefined();
      service.destroy();
    });

    it("should create service with valid mobileTalkButton", () => {
      const mobileTalkButton = document.createElement("a");
      const elements = {
        ...createMockElements(),
        mobileTalkButton,
      };

      const service = createMobileMenuService(elements);
      expect(service).toBeDefined();
      service.destroy();
    });
  });

  describe("error recovery", () => {
    it("should log error when initialization fails", () => {
      const elements = createMockElements();

      const service = createMobileMenuService(elements);

      vi.spyOn(elements.menuButton, "addEventListener").mockImplementation(
        () => {
          throw new Error("Event listener error");
        }
      );

      expect(() => service.initialize()).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should allow destroy to be called even if initialization failed", () => {
      const elements = createMockElements();

      const service = createMobileMenuService(elements);

      vi.spyOn(elements.menuButton, "addEventListener").mockImplementation(
        () => {
          throw new Error("Event listener error");
        }
      );

      try {
        service.initialize();
      } catch {
        // Expected error
      }

      expect(() => service.destroy()).not.toThrow();
    });

    it("should log error when destroy fails but not throw", () => {
      const elements = createMockElements();

      const service = createMobileMenuService(elements);

      vi.spyOn(elements.menuButton, "removeEventListener").mockImplementation(
        () => {
          throw new Error("Remove listener error");
        }
      );

      expect(() => service.destroy()).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("multiple missing elements", () => {
    it("should throw error for first missing element", () => {
      const elements = {
        ...createMockElements(),
        menuButton: null as unknown as HTMLElement,
        mobileMenu: null as unknown as HTMLElement,
      };

      expect(() => createMobileMenuService(elements)).toThrow(
        DOMElementNotFoundError
      );
      expect(() => createMobileMenuService(elements)).toThrow(
        "Required DOM element not found: menuButton"
      );
    });
  });
});
