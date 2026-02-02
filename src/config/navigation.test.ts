import { describe, it, expect } from "vitest";
import {
  getNavigationItems,
  navigationItems,
  type NavigationItem,
} from "./navigation";

describe("getNavigationItems", () => {
  it("returns items with hash hrefs when on homepage (isHomePage: true)", () => {
    const items = getNavigationItems(true);

    expect(items).toHaveLength(navigationItems.length);
    expect(items[0]).toMatchObject({
      label: "About",
      section: "about",
      href: "#about",
    });
    expect(items[1]).toMatchObject({
      label: "Works",
      section: "projects",
      href: "#projects",
    });
    expect(items[2]).toMatchObject({
      label: "Contact",
      section: "contact",
      href: "#contact",
    });
    expect(items[3]).toMatchObject({
      label: "Blog",
      section: "blog",
      href: "#blog",
    });
  });

  it("returns items with path hrefs when not on homepage (isHomePage: false)", () => {
    const items = getNavigationItems(false);

    expect(items).toHaveLength(navigationItems.length);
    expect(items[0]).toMatchObject({
      label: "About",
      section: "about",
      href: "/#about",
    });
    expect(items[1]).toMatchObject({
      label: "Works",
      section: "projects",
      href: "/#projects",
    });
    expect(items[2]).toMatchObject({
      label: "Contact",
      section: "contact",
      href: "/#contact",
    });
    expect(items[3]).toMatchObject({
      label: "Blog",
      section: "blog",
      href: "/blog",
    });
  });

  it("returns items with label, section, and href for each entry", () => {
    const items = getNavigationItems(true);

    items.forEach((item: NavigationItem) => {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("section");
      expect(item).toHaveProperty("href");
      expect(typeof item.label).toBe("string");
      expect(typeof item.section).toBe("string");
      expect(typeof item.href).toBe("string");
    });
  });
});
