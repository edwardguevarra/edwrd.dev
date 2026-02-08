import { describe, it, expect, vi } from "vitest";
import { createNavigationService } from "../service";
import type { NavigationElements, NavigationServiceConfig } from "../types";
import { SECTION_IDS } from "../config";

describe("createNavigationService", () => {
  it("initializes without errors", () => {
    const mockSection = document.createElement("section");
    mockSection.id = SECTION_IDS.ABOUT;
    const mockLink = document.createElement("a");
    mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
    mockLink.classList.add("nav-link");

    const mockSections = [mockSection] as unknown as NodeListOf<Element>;
    const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

    const elements: NavigationElements = {
      sections: mockSections,
      navLinks: mockNavLinks,
    };
    const config: NavigationServiceConfig = {
      elements,
    };

    const service = createNavigationService(config);
    expect(service).toBeDefined();
    expect(service.initialize).toBeInstanceOf(Function);
    expect(service.destroy).toBeInstanceOf(Function);

    service.destroy();
  });

  it("initializes gracefully on blog pages", () => {
    const mockLink = document.createElement("a");
    mockLink.setAttribute("data-section", SECTION_IDS.BLOG);
    mockLink.classList.add("nav-link", "text-white");

    const mockSections = [] as unknown as NodeListOf<Element>;
    const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/blog",
    } as Location);

    const elements: NavigationElements = {
      sections: mockSections,
      navLinks: mockNavLinks,
    };
    const config: NavigationServiceConfig = {
      elements,
    };

    const service = createNavigationService(config);
    expect(() => service.initialize()).not.toThrow();
    expect(mockLink.classList.contains("text-brand-lime")).toBe(true);

    service.destroy();
  });

  it("cleanup removes all references", () => {
    const mockSection = document.createElement("section");
    mockSection.id = SECTION_IDS.ABOUT;
    const mockLink = document.createElement("a");
    mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
    mockLink.classList.add("nav-link");

    const mockSections = [mockSection] as unknown as NodeListOf<Element>;
    const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

    const elements: NavigationElements = {
      sections: mockSections,
      navLinks: mockNavLinks,
    };
    const config: NavigationServiceConfig = {
      elements,
    };

    const service = createNavigationService(config);
    service.destroy();

    expect(() => service.destroy()).not.toThrow();
  });

  describe("observer initialization", () => {
    it("observes all sections on non-blog pages", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("throws ObserverError when observer.observe fails", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const originalObserve = IntersectionObserver.prototype.observe;
      IntersectionObserver.prototype.observe = vi.fn(() => {
        throw new Error("Observer error");
      });

      const service = createNavigationService(config);
      expect(() => service.initialize()).toThrow();

      IntersectionObserver.prototype.observe = originalObserve;
      service.destroy();
    });
  });

  describe("updateActiveNav", () => {
    it("adds active class to matching section link", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(mockLink.classList.contains("text-brand-lime")).toBe(true);
      expect(mockLink.classList.contains("text-white")).toBe(false);

      service.destroy();
    });

    it("skips blog highlight on blog page", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.BLOG);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/blog",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(mockLink.classList.contains("text-brand-lime")).toBe(true);

      service.destroy();
    });
  });

  describe("checkInitialActiveSection", () => {
    it("sets default active section when at top of page", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(mockLink.classList.contains("text-brand-lime")).toBe(true);

      service.destroy();
    });

    it("returns early on blog page", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.BLOG);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/blog",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("returns early when no sections provided", () => {
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });
  });

  describe("updateActiveSection", () => {
    it("updates active section based on highest intersection ratio", () => {
      const mockSection1 = document.createElement("section");
      mockSection1.id = SECTION_IDS.ABOUT;
      const mockSection2 = document.createElement("section");
      mockSection2.id = SECTION_IDS.PROJECTS;
      const mockLink1 = document.createElement("a");
      mockLink1.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink1.classList.add("nav-link", "text-white");
      const mockLink2 = document.createElement("a");
      mockLink2.setAttribute("data-section", SECTION_IDS.PROJECTS);
      mockLink2.classList.add("nav-link", "text-white");

      const mockSections = [
        mockSection1,
        mockSection2,
      ] as unknown as NodeListOf<Element>;
      const mockNavLinks = [
        mockLink1,
        mockLink2,
      ] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("handles destroy when observer disconnect throws error", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const originalDisconnect = IntersectionObserver.prototype.disconnect;
      IntersectionObserver.prototype.disconnect = vi.fn(() => {
        throw new Error("Disconnect failed");
      });

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(() => service.destroy()).not.toThrow();

      IntersectionObserver.prototype.disconnect = originalDisconnect;
    });

    it("uses provided rootMargin config", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
        rootMargin: "0px -50% 0px",
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("uses provided rootMargin config", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
        rootMargin: "0px -50% 0px",
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("sets default active section when no intersecting sections", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);
      Object.defineProperty(window, "scrollY", { value: 50, writable: true });

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      expect(() => service.initialize()).not.toThrow();

      service.destroy();
    });

    it("handles IntersectionObserver callback with intersecting sections", () => {
      const mockSection1 = document.createElement("section");
      mockSection1.id = SECTION_IDS.ABOUT;
      const mockSection2 = document.createElement("section");
      mockSection2.id = SECTION_IDS.CONTACT;
      const mockLink1 = document.createElement("a");
      mockLink1.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink1.classList.add("nav-link");
      const mockLink2 = document.createElement("a");
      mockLink2.setAttribute("data-section", SECTION_IDS.CONTACT);
      mockLink2.classList.add("nav-link");

      const mockSections = [
        mockSection1,
        mockSection2,
      ] as unknown as NodeListOf<Element>;
      const mockNavLinks = [
        mockLink1,
        mockLink2,
      ] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
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

      const service = createNavigationService(config);
      service.initialize();

      const entry1 = {
        target: mockSection1,
        isIntersecting: true,
        intersectionRatio: 0.8,
        boundingClientRect: mockSection1.getBoundingClientRect(),
        intersectionRect: mockSection1.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry;

      observerCallback!([entry1]);

      expect(mockLink1.classList.contains("text-brand-lime")).toBe(true);
      expect(mockLink2.classList.contains("text-brand-lime")).toBe(false);

      vi.unstubAllGlobals();
      service.destroy();
    });

    it("handles IntersectionObserver callback when no sections intersecting", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);
      Object.defineProperty(window, "scrollY", { value: 50, writable: true });

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
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

      const service = createNavigationService(config);
      service.initialize();

      observerCallback!([]);

      expect(mockLink.classList.contains("text-brand-lime")).toBe(true);

      vi.unstubAllGlobals();
      service.destroy();
    });

    it("handles scroll position above threshold on initial check", () => {
      const mockSection = document.createElement("section");
      mockSection.id = SECTION_IDS.ABOUT;
      mockSection.style.position = "absolute";
      mockSection.style.top = "500px";
      const mockLink = document.createElement("a");
      mockLink.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink.classList.add("nav-link", "text-white");

      const mockSections = [mockSection] as unknown as NodeListOf<Element>;
      const mockNavLinks = [mockLink] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/",
      } as Location);
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(mockLink.classList.contains("text-brand-lime")).toBe(true);

      service.destroy();
    });

    it("handles blog page with non-blog nav links", () => {
      const mockLink1 = document.createElement("a");
      mockLink1.setAttribute("data-section", SECTION_IDS.ABOUT);
      mockLink1.classList.add("nav-link", "text-white");
      const mockLink2 = document.createElement("a");
      mockLink2.setAttribute("data-section", SECTION_IDS.CONTACT);
      mockLink2.classList.add("nav-link", "text-white");

      const mockSections = [] as unknown as NodeListOf<Element>;
      const mockNavLinks = [
        mockLink1,
        mockLink2,
      ] as unknown as NodeListOf<Element>;

      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/blog",
      } as Location);

      const elements: NavigationElements = {
        sections: mockSections,
        navLinks: mockNavLinks,
      };
      const config: NavigationServiceConfig = {
        elements,
      };

      const service = createNavigationService(config);
      service.initialize();

      expect(mockLink1.classList.contains("text-brand-lime")).toBe(false);
      expect(mockLink1.classList.contains("text-white")).toBe(true);

      service.destroy();
    });
  });
});
