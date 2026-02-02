export interface NavigationItem {
  href: string;
  label: string;
  section: string;
}

export interface NavLinkProps {
  href: string;
  label: string;
  section: string;
  isActive?: boolean;
  isMobile?: boolean;
  prefetch?: boolean;
}

export interface MobileMenuProps {
  navItems: NavigationItem[];
  isBlogPage: boolean;
}
