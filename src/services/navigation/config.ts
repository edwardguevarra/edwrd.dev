import type { NavigationItem } from "../../../types/header.types";

export const NAVIGATION_DEFAULT_ROOT_MARGIN = "-20% 0px -60% 0px";
export const NAVIGATION_DEFAULT_THRESHOLD = 0;
export const NAVIGATION_SCROLL_TOP_THRESHOLD_PX = 100;
export const NAVIGATION_INITIAL_VIEWPORT_RATIO = 0.3;

export const SECTION_IDS = {
  ABOUT: "about",
  PROJECTS: "projects",
  CONTACT: "contact",
  BLOG: "blog",
} as const;

export const LINK_CLASSES = {
  ACTIVE: "text-brand-lime",
  INACTIVE: "text-white",
} as const;

const BASE_NAVIGATION_ITEMS: Omit<NavigationItem, "href">[] = [
  { label: "About", section: SECTION_IDS.ABOUT },
  { label: "Works", section: SECTION_IDS.PROJECTS },
  { label: "Contact", section: SECTION_IDS.CONTACT },
  { label: "Blog", section: SECTION_IDS.BLOG },
];

const DEFAULT_ACTIVE_SECTION = SECTION_IDS.ABOUT;
const BLOG_PATH_PREFIX = "/blog";

export function getNavigationItems(isHomePage: boolean): NavigationItem[] {
  return BASE_NAVIGATION_ITEMS.map((item) => {
    const href = computeHref(item.section, isHomePage);
    return { ...item, href };
  });
}

export function computeHref(section: string, isHomePage: boolean): string {
  if (section === SECTION_IDS.BLOG) {
    return isHomePage ? `#${SECTION_IDS.BLOG}` : `/blog`;
  }
  return `#${section}`;
}

export function isBlogPage(pathname: string): boolean {
  return pathname.startsWith(BLOG_PATH_PREFIX);
}

export function getDefaultActiveSection(): string {
  return DEFAULT_ACTIVE_SECTION;
}

export function getActiveLinkClasses(isActive: boolean) {
  if (isActive) {
    return LINK_CLASSES.ACTIVE;
  }
  return LINK_CLASSES.INACTIVE;
}

export function shouldSkipBlogHighlight(
  linkSection: string,
  isCurrentPageBlog: boolean
): boolean {
  return linkSection === SECTION_IDS.BLOG && isCurrentPageBlog;
}
