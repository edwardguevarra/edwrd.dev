export interface DOMElements {
  sections?: NodeListOf<Element>;
  navLinks?: NodeListOf<Element>;
  mobileMenuButton?: HTMLElement;
  mobileMenu?: HTMLElement;
  mobileMenuBackdrop?: HTMLElement;
  menuIcon?: HTMLElement;
  closeIcon?: HTMLElement;
  mobileTalkButton?: HTMLElement;
  animatedElements?: NodeListOf<HTMLElement>;
}

export interface Service {
  initialize(): void;
  destroy(): void;
}

export interface NavigationConfig {
  rootMargin?: string;
  threshold?: number;
}

export interface ScrollAnimationConfig {
  rootMargin?: string;
  threshold?: number;
  animateClass?: string;
}

export interface NavigationService extends Service {
  initialize(): void;
  destroy(): void;
}

export interface MobileMenuService extends Service {
  open(): void;
  close(): void;
  initialize(): void;
  destroy(): void;
}

export interface ScrollAnimationService extends Service {
  initialize(): void;
  destroy(): void;
}

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}
