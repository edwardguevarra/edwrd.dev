import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createScrollAnimationService } from "../service";
import type {
  ScrollAnimationElements,
  ScrollAnimationServiceConfig,
} from "../types";

describe("Scroll Animation Service Validation", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockElements = (count: number): ScrollAnimationElements => ({
    animatedElements: Array.from({ length: count }, () => {
      const el = document.createElement("div");
      el.setAttribute("data-animate", "true");
      return el;
    }) as unknown as NodeListOf<HTMLElement>,
  });

  describe("optional elements handling", () => {
    it("should log warning when animatedElements is null", () => {
      const elements: ScrollAnimationElements = {
        animatedElements: null as unknown as NodeListOf<HTMLElement>,
      };
      const config: ScrollAnimationServiceConfig = { elements };

      createScrollAnimationService(config);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" &&
            arg.includes("No animated elements provided")
        )
      );
      expect(hasWarning).toBe(true);
    });

    it("should log warning when animatedElements is empty", () => {
      const elements = createMockElements(0);
      const config: ScrollAnimationServiceConfig = { elements };

      createScrollAnimationService(config);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" &&
            arg.includes("No animated elements provided")
        )
      );
      expect(hasWarning).toBe(true);
    });

    it("should not log warning when animatedElements has elements", () => {
      const elements = createMockElements(3);
      const config: ScrollAnimationServiceConfig = { elements };

      createScrollAnimationService(config);

      const calls = consoleWarnSpy.mock.calls;
      const hasWarning = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" &&
            arg.includes("No animated elements provided")
        )
      );
      expect(hasWarning).toBe(false);
    });

    it("should create service with null animatedElements", () => {
      const elements: ScrollAnimationElements = {
        animatedElements: null as unknown as NodeListOf<HTMLElement>,
      };
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);
      expect(service).toBeDefined();

      expect(() => service.initialize()).not.toThrow();
      service.destroy();
    });

    it("should create service with empty animatedElements", () => {
      const elements = createMockElements(0);
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);
      expect(service).toBeDefined();

      expect(() => service.initialize()).not.toThrow();
      service.destroy();
    });

    it("should create service with valid animatedElements", () => {
      const elements = createMockElements(3);
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);
      expect(service).toBeDefined();

      expect(() => service.initialize()).not.toThrow();
      service.destroy();
    });
  });

  describe("reduced motion preference", () => {
    it("should log info when reduced motion is preferred with no elements", () => {
      const elements = createMockElements(0);
      const config: ScrollAnimationServiceConfig = { elements };

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const service = createScrollAnimationService(config);
      service.initialize();

      const calls = consoleInfoSpy.mock.calls;
      const hasInfo = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("Reduced motion preferred")
        )
      );
      expect(hasInfo).toBe(true);
      service.destroy();
    });

    it("should log info when reduced motion is preferred with elements", () => {
      const elements = createMockElements(2);
      const config: ScrollAnimationServiceConfig = { elements };

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const service = createScrollAnimationService(config);
      service.initialize();

      const calls = consoleInfoSpy.mock.calls;
      const hasInfo = calls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("Reduced motion preferred")
        )
      );
      expect(hasInfo).toBe(true);
      service.destroy();
    });

    it("should set element styles when reduced motion is preferred", () => {
      const elements = createMockElements(2);
      const config: ScrollAnimationServiceConfig = { elements };

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const service = createScrollAnimationService(config);
      service.initialize();

      Array.from(elements.animatedElements).forEach((el) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transform).toBe("none");
      });
      service.destroy();
    });
  });

  describe("error recovery", () => {
    it("should log error when initialization fails", () => {
      const elements = createMockElements(1);
      const config: ScrollAnimationServiceConfig = { elements };

      vi.spyOn(window, "matchMedia").mockImplementation(() => {
        throw new Error("MatchMedia error");
      });

      const service = createScrollAnimationService(config);

      expect(() => service.initialize()).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should allow destroy to be called even if initialization failed", () => {
      const elements = createMockElements(1);
      const config: ScrollAnimationServiceConfig = { elements };

      vi.spyOn(window, "matchMedia").mockImplementation(() => {
        throw new Error("MatchMedia error");
      });

      const service = createScrollAnimationService(config);

      try {
        service.initialize();
      } catch {
        // Expected error
      }

      expect(() => service.destroy()).not.toThrow();
    });

    it("should log error when destroy fails but not throw", () => {
      const elements = createMockElements(1);
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);
      service.initialize();

      const originalDisconnect = IntersectionObserver.prototype.disconnect;
      IntersectionObserver.prototype.disconnect = () => {
        throw new Error("Disconnect error");
      };

      expect(() => service.destroy()).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      IntersectionObserver.prototype.disconnect = originalDisconnect;
    });
  });

  describe("observer operations", () => {
    it("should skip observeElements when no animated elements", () => {
      const elements = createMockElements(0);
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);
      service.initialize();

      expect(() => service.destroy()).not.toThrow();
    });

    it("should handle multiple elements successfully", () => {
      const elements = createMockElements(5);
      const config: ScrollAnimationServiceConfig = { elements };

      const service = createScrollAnimationService(config);

      expect(() => service.initialize()).not.toThrow();
      expect(() => service.destroy()).not.toThrow();
    });
  });
});
