import { describe, it, expect } from "vitest";
import {
  getNavigationItems,
  SECTION_IDS,
  getDefaultActiveSection,
  shouldSkipBlogHighlight,
  getActiveLinkClasses,
  isBlogPage,
  computeHref,
} from "../config";
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

describe("getDefaultActiveSection", () => {
  it("returns ABOUT as default active section", () => {
    expect(getDefaultActiveSection()).toBe(SECTION_IDS.ABOUT);
  });
});

describe("shouldSkipBlogHighlight", () => {
  it("returns true when link section is blog and current page is blog", () => {
    expect(shouldSkipBlogHighlight(SECTION_IDS.BLOG, true)).toBe(true);
  });

  it("returns false when link section is blog but current page is not blog", () => {
    expect(shouldSkipBlogHighlight(SECTION_IDS.BLOG, false)).toBe(false);
  });

  it("returns false when link section is not blog and current page is blog", () => {
    expect(shouldSkipBlogHighlight(SECTION_IDS.ABOUT, true)).toBe(false);
  });

  it("returns false when link section is not blog and current page is not blog", () => {
    expect(shouldSkipBlogHighlight(SECTION_IDS.ABOUT, false)).toBe(false);
  });
});

describe("getActiveLinkClasses", () => {
  it("returns active class when isActive is true", () => {
    expect(getActiveLinkClasses(true)).toBe("text-brand-lime");
  });

  it("returns inactive class when isActive is false", () => {
    expect(getActiveLinkClasses(false)).toBe("text-white");
  });
});

describe("isBlogPage", () => {
  it("returns true for /blog path", () => {
    expect(isBlogPage("/blog")).toBe(true);
  });

  it("returns true for /blog/posts path", () => {
    expect(isBlogPage("/blog/posts")).toBe(true);
  });

  it("returns false for root path", () => {
    expect(isBlogPage("/")).toBe(false);
  });

  it("returns false for other paths", () => {
    expect(isBlogPage("/about")).toBe(false);
    expect(isBlogPage("/projects")).toBe(false);
  });
});

describe("computeHref", () => {
  it("returns blog path when section is blog and isHomePage is false", () => {
    expect(computeHref(SECTION_IDS.BLOG, false)).toBe("/blog");
  });

  it("returns blog hash when section is blog and isHomePage is true", () => {
    expect(computeHref(SECTION_IDS.BLOG, true)).toBe("#blog");
  });

  it("returns hash for other sections when isHomePage is true", () => {
    expect(computeHref(SECTION_IDS.ABOUT, true)).toBe("#about");
    expect(computeHref(SECTION_IDS.PROJECTS, true)).toBe("#projects");
    expect(computeHref(SECTION_IDS.CONTACT, true)).toBe("#contact");
  });

  it("returns root hash for other sections when isHomePage is false", () => {
    expect(computeHref(SECTION_IDS.ABOUT, false)).toBe("/#about");
    expect(computeHref(SECTION_IDS.PROJECTS, false)).toBe("/#projects");
    expect(computeHref(SECTION_IDS.CONTACT, false)).toBe("/#contact");
  });

  it("returns hash for non-standard sections when isHomePage is true", () => {
    expect(computeHref("custom-section", true)).toBe("#custom-section");
    expect(computeHref("test-section", true)).toBe("#test-section");
  });

  it("returns root hash for non-standard sections when isHomePage is false", () => {
    expect(computeHref("custom-section", false)).toBe("/#custom-section");
    expect(computeHref("test-section", false)).toBe("/#test-section");
  });
});
