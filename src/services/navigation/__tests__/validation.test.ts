import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNavigationService } from "../service";
import type { NavigationElements, NavigationServiceConfig } from "../types";
import { ServiceInitializationError } from "../../../errors/types";

describe("Navigation Service Validation", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("window", {
      location: { pathname: "/" },
      scrollY: 0,
      innerHeight: 800,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("required elements validation", () => {
    it("should throw ServiceInitializationError when navLinks is null", () => {
      const elements: NavigationElements = {
        navLinks: null as unknown as NodeListOf<Element>,
        sections: [] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      expect(() => createNavigationService(config)).toThrow(
        ServiceInitializationError
      );
      expect(() => createNavigationService(config)).toThrow(
        "navLinks must be provided"
      );
    });

    it("should throw ServiceInitializationError when navLinks is empty", () => {
      const elements: NavigationElements = {
        navLinks: [] as unknown as NodeListOf<Element>,
        sections: [] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      expect(() => createNavigationService(config)).toThrow(
        ServiceInitializationError
      );
      expect(() => createNavigationService(config)).toThrow(
        "navLinks must be provided"
      );
    });

    it("should create service with valid navLinks and empty sections", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "test");
      mockLink.classList.add("nav-link");

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: [] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      const service = createNavigationService(config);
      expect(service).toBeDefined();
      service.destroy();
    });
  });

  describe("optional elements handling", () => {
    it("should log warning when sections is null", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "test");
      mockLink.classList.add("nav-link");

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: null as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      createNavigationService(config);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("No sections provided")
        )
      );
      expect(hasWarning).toBe(true);
    });

    it("should log warning when sections is empty", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "test");
      mockLink.classList.add("nav-link");

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: [] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      createNavigationService(config);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("No sections provided")
        )
      );
      expect(hasWarning).toBe(true);
    });
  });

  describe("initialization with missing sections", () => {
    it("should initialize successfully when sections is empty on blog page", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "blog");
      mockLink.classList.add("nav-link");

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: [] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      vi.stubGlobal("window", {
        location: { pathname: "/blog" },
        scrollY: 0,
        innerHeight: 800,
      });

      const service = createNavigationService(config);

      expect(() => service.initialize()).not.toThrow();
      service.destroy();
    });
  });

  describe("error recovery", () => {
    it("should log error when initialization fails", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "test");
      mockLink.classList.add("nav-link");

      const mockSection = document.createElement("section");
      mockSection.id = "test";

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: [mockSection] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      vi.spyOn(window, "location", "get").mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const service = createNavigationService(config);

      expect(() => service.initialize()).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      service.destroy();
    });

    it("should allow destroy to be called even if initialization failed", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", "test");
      mockLink.classList.add("nav-link");

      const mockSection = document.createElement("section");
      mockSection.id = "test";

      const elements: NavigationElements = {
        navLinks: [mockLink] as unknown as NodeListOf<Element>,
        sections: [mockSection] as unknown as NodeListOf<Element>,
      };
      const config: NavigationServiceConfig = { elements };

      vi.spyOn(window, "location", "get").mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const service = createNavigationService(config);

      try {
        service.initialize();
      } catch {
        // Expected error
      }

      expect(() => service.destroy()).not.toThrow();
    });
  });
});
