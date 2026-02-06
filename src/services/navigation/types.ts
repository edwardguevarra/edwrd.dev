import type { NavigationConfig } from "../../types/shared.types";

export interface NavigationElements {
  sections: NodeListOf<Element>;
  navLinks: NodeListOf<Element>;
}

export interface NavigationServiceConfig extends NavigationConfig {
  elements: NavigationElements;
}
