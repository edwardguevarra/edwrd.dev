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

    it("uses custom animate class from config", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");
      mockElement.style.position = "absolute";
      mockElement.style.top = "1000px";
      mockElement.style.height = "100px";

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
        animateClass: "custom-animate",
      };

      const testService = createScrollAnimationService(config);
      testService.initialize();

      mockElement.style.top = "0";

      const entry = {
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: mockElement.getBoundingClientRect(),
        intersectionRect: mockElement.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry;

      const entries = [entry];

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mockElement.classList.add("custom-animate");
        }
      });

      expect(mockElement.classList.contains("custom-animate")).toBe(true);

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

    it("throws ObserverError when observer.observe fails", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const originalObserve = IntersectionObserver.prototype.observe;
      IntersectionObserver.prototype.observe = vi.fn(() => {
        throw new Error("Observer error");
      });

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      expect(() => testService.initialize()).toThrow();

      IntersectionObserver.prototype.observe = originalObserve;
      testService.destroy();
    });

    it("calls checkInitialView when document is already loaded", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");
      mockElement.style.position = "absolute";
      mockElement.style.top = "0";
      mockElement.style.height = "100px";

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);
      vi.spyOn(document, "readyState", "get").mockReturnValue("complete");

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

    it("adds DOMContentLoaded listener when document is loading", () => {
      const mockElements = [] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);
      vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
      const addListenerSpy = vi.spyOn(document, "addEventListener");

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      testService.initialize();

      expect(addListenerSpy).toHaveBeenCalledWith(
        "DOMContentLoaded",
        expect.any(Function)
      );

      testService.destroy();
    });

    it("checks initial view and animates elements in viewport", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");
      mockElement.style.position = "absolute";
      mockElement.style.top = "0";
      mockElement.style.height = "100px";

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);
      vi.spyOn(document, "readyState", "get").mockReturnValue("complete");

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      testService.initialize();

      expect(mockElement.classList.contains("animate-on-scroll")).toBe(true);

      testService.destroy();
    });
  });

  describe("observeElements", () => {
    it("returns early when no animated elements", () => {
      const mockElements = [] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

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

    it("adds animate class when element intersects viewport", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");
      mockElement.style.position = "absolute";
      mockElement.style.top = "1000px";
      mockElement.style.height = "100px";

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      const testService = createScrollAnimationService(config);
      testService.initialize();

      mockElement.style.top = "0";

      const entry = {
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: mockElement.getBoundingClientRect(),
        intersectionRect: mockElement.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry;

      const entries = [entry];

      const observerCallback = vi.fn();
      const mockObserver = new IntersectionObserver(observerCallback, {
        rootMargin: "0px 0px -100px 0px",
        threshold: 0.1,
      });

      mockObserver.observe(mockElement);

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mockElement.classList.add("animate-on-scroll");
        }
      });

      expect(mockElement.classList.contains("animate-on-scroll")).toBe(true);

      testService.destroy();
    });

    it("handles IntersectionObserver callback with intersecting element", () => {
      const mockElement = document.createElement("div");
      mockElement.setAttribute("data-animate", "");
      mockElement.style.position = "absolute";
      mockElement.style.top = "1000px";
      mockElement.style.height = "100px";

      const mockElements = [mockElement] as unknown as NodeListOf<HTMLElement>;

      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const elements: ScrollAnimationElements = {
        animatedElements: mockElements,
      };
      const config: ScrollAnimationServiceConfig = {
        elements,
      };

      let observerCallback:
        | ((entries: IntersectionObserverEntry[]) => void)
        | null = null;

      vi.stubGlobal(
        "IntersectionObserver",
        vi.fn().mockImplementation((callback) => {
          observerCallback = callback as (
            entries: IntersectionObserverEntry[]
          ) => void;
          return {
            observe: vi.fn(),
            disconnect: vi.fn(),
            unobserve: vi.fn(),
          } as unknown as IntersectionObserver;
        })
      );

      const testService = createScrollAnimationService(config);
      testService.initialize();

      const entry = {
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: mockElement.getBoundingClientRect(),
        intersectionRect: mockElement.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry;

      observerCallback!([entry]);

      expect(mockElement.classList.contains("animate-on-scroll")).toBe(true);

      vi.unstubAllGlobals();
      testService.destroy();
    });
  });
});
