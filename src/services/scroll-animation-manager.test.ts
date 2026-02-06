import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ScrollAnimationManager } from "./scroll-animation-manager";

describe("ScrollAnimationManager", () => {
  let manager: ScrollAnimationManager;

  beforeEach(() => {
    manager = new ScrollAnimationManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    manager.destroy();
    vi.useRealTimers();
  });

  it("initializes without errors", () => {
    expect(manager).toBeInstanceOf(ScrollAnimationManager);
  });

  it("initializes gracefully when no animated elements exist", () => {
    const mockQuerySelector = vi
      .spyOn(document, "querySelectorAll")
      .mockReturnValue([] as unknown as NodeListOf<HTMLElement>);

    const testManager = new ScrollAnimationManager();
    expect(() => testManager.initialize()).not.toThrow();

    testManager.destroy();
    mockQuerySelector.mockRestore();
  });

  describe("destroy", () => {
    it("disconnects observer when destroy is called", () => {
      manager.initialize();
      const disconnectSpy = vi.spyOn(
        (manager as unknown as { observer: IntersectionObserver | null })
          .observer as IntersectionObserver,
        "disconnect"
      );

      manager.destroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("handles destroy when observer is null", () => {
      const testManager = new ScrollAnimationManager();
      expect(() => testManager.destroy()).not.toThrow();
    });
  });

  describe("initialize", () => {
    it("creates IntersectionObserver when reduced motion is off", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      manager.initialize();

      expect(
        (manager as unknown as { observer: IntersectionObserver | null })
          .observer
      ).toBeInstanceOf(IntersectionObserver);
    });

    it("does not create observer when reduced motion is preferred", () => {
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

      const testManager = new ScrollAnimationManager();
      testManager.initialize();

      expect(
        (testManager as unknown as { observer: IntersectionObserver | null })
          .observer
      ).toBeNull();

      testManager.destroy();
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

      const testManager = new ScrollAnimationManager();
      testManager.initialize();

      mockElements.forEach((el) => {
        expect(el.style.opacity).toBe("1");
        expect(el.style.transform).toBe("none");
      });

      testManager.destroy();
    });
  });
});
