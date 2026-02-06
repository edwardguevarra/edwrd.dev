import { describe, it, expect } from "vitest";
import { getNavigationItems, SECTION_IDS } from "../config";
import type { NavigationItem } from "../../../types/header.types";

describe("getNavigationItems", () => {
  it("returns items with hash hrefs when on homepage (isHomePage: true)", () => {
    const items = getNavigationItems(true);

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({
      label: "About",
      section: SECTION_IDS.ABOUT,
      href: "#about",
    });
    expect(items[1]).toMatchObject({
      label: "Works",
      section: SECTION_IDS.PROJECTS,
      href: "#projects",
    });
    expect(items[2]).toMatchObject({
      label: "Contact",
      section: SECTION_IDS.CONTACT,
      href: "#contact",
    });
    expect(items[3]).toMatchObject({
      label: "Blog",
      section: SECTION_IDS.BLOG,
      href: "#blog",
    });
  });

  it("returns items with path hrefs when not on homepage (isHomePage: false)", () => {
    const items = getNavigationItems(false);

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({
      label: "About",
      section: SECTION_IDS.ABOUT,
      href: "/#about",
    });
    expect(items[1]).toMatchObject({
      label: "Works",
      section: SECTION_IDS.PROJECTS,
      href: "/#projects",
    });
    expect(items[2]).toMatchObject({
      label: "Contact",
      section: SECTION_IDS.CONTACT,
      href: "/#contact",
    });
    expect(items[3]).toMatchObject({
      label: "Blog",
      section: SECTION_IDS.BLOG,
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
