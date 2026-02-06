import { describe, it, expect, vi } from "vitest";
import { createNavigationService } from "../service";
import type { NavigationElements, NavigationServiceConfig } from "../types";

describe("createNavigationService", () => {
  it("initializes without errors", () => {
    const mockSection = document.createElement("section");
    mockSection.id = "about";
    const mockLink = document.createElement("a");
    mockLink.setAttribute("data-section", "about");
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
    mockLink.setAttribute("data-section", "blog");
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
    mockSection.id = "about";
    const mockLink = document.createElement("a");
    mockLink.setAttribute("data-section", "about");
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
});
