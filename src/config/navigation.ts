import type { NavigationItem } from "../types/header.types";

export const navigationItems: Omit<NavigationItem, "href">[] = [
  { label: "About", section: "about" },
  { label: "Works", section: "projects" },
  { label: "Contact", section: "contact" },
  { label: "Blog", section: "blog" },
];

/**
 * Get navigation items with computed hrefs based on current page
 */
export function getNavigationItems(isHomePage: boolean): NavigationItem[] {
  return navigationItems.map((item) => {
    let href: string;

    if (item.section === "blog") {
      // Blog: hash on homepage (scrolls to section), full path on other pages
      href = isHomePage ? "#blog" : "/blog";
    } else {
      // Other sections: hash on homepage, full path on other pages
      href = isHomePage ? `#${item.section}` : `/#${item.section}`;
    }

    return {
      ...item,
      href,
    };
  });
}
