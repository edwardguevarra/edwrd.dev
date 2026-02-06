import { describe, it, expect, afterEach, vi } from "vitest";
import { createScrollAnimationService } from "../service";
import type {
  ScrollAnimationElements,
  ScrollAnimationServiceConfig,
} from "../types";

describe("createScrollAnimationService", () => {
  let service: ReturnType<typeof createScrollAnimationService>;

  afterEach(() => {
    service?.destroy();
    vi.restoreAllMocks();
  });

  it("initializes without errors", () => {
    const mockElements =
      document.querySelectorAll<HTMLElement>("[data-animate]");
    const elements: ScrollAnimationElements = {
      animatedElements: mockElements,
    };
    const config: ScrollAnimationServiceConfig = {
      elements,
    };

    service = createScrollAnimationService(config);
    expect(service).toBeDefined();
    expect(service.initialize).toBeInstanceOf(Function);
    expect(service.destroy).toBeInstanceOf(Function);
  });

  it("initializes gracefully when no animated elements exist", () => {
    const mockElements = [] as unknown as NodeListOf<HTMLElement>;
    const elements: ScrollAnimationElements = {
      animatedElements: mockElements,
    };
    const config: ScrollAnimationServiceConfig = {
      elements,
    };

    const testService = createScrollAnimationService(config);
    expect(() => testService.initialize()).not.toThrow();

    testService.destroy();
  });

  describe("destroy", () => {
    it("can be called without errors", () => {
      const mockElements =
        document.querySelectorAll<HTMLElement>("[data-animate]");
      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      service = createScrollAnimationService(config);
      service.initialize();

      expect(() => service.destroy()).not.toThrow();
    });

    it("handles destroy when observer is null", () => {
      const mockElements = [] as unknown as NodeListOf<HTMLElement>;
      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      expect(() => testService.destroy()).not.toThrow();
    });
  });

  describe("initialize", () => {
    it("creates service successfully when reduced motion is off", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const mockElements =
        document.querySelectorAll<HTMLElement>("[data-animate]");
      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      expect(() => testService.initialize()).not.toThrow();

      testService.destroy();
    });

    it("handles reduced motion preference gracefully", () => {
      const mockElements = [
        document.createElement("div"),
        document.createElement("div"),
      ];
      mockElements.forEach((el) => el.setAttribute("data-animate", ""));

      vi.spyOn(document, "querySelectorAll").mockReturnValue(
        mockElements as unknown as NodeListOf<HTMLElement>
      );
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements as unknown as NodeListOf<HTMLElement>,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      expect(() => testService.initialize()).not.toThrow();

      testService.destroy();
    });

    it("sets element styles when reduced motion is preferred", () => {
      const mockElements = [
        document.createElement("div"),
        document.createElement("div"),
      ];
      mockElements.forEach((el) => {
        el.setAttribute("data-animate", "");
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      });

      vi.spyOn(document, "querySelectorAll").mockReturnValue(
        mockElements as unknown as NodeListOf<HTMLElement>
      );
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements as unknown as NodeListOf<HTMLElement>,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      testService.initialize();

      mockElements.forEach((el) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transform).toBe("none");
      });

      testService.destroy();
    });
  });
});
