import type { ScrollAnimationConfig } from "../../types/shared.types";

export interface ScrollAnimationElements {
  animatedElements: NodeListOf<HTMLElement>;
}

export interface ScrollAnimationServiceConfig extends ScrollAnimationConfig {
  elements: ScrollAnimationElements;
}
