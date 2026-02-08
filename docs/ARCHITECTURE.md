# Architecture Documentation

This document describes the architectural patterns, boundaries, and conventions used in this codebase.

## Overview

The codebase follows a layered architecture with clear separation of concerns:

1. **Component Layer** - Presentation and UI structure (Astro components)
2. **Service Layer** - Business logic and DOM interactions (TypeScript services)
3. **Type Layer** - Shared contracts and interfaces
4. **Utility Layer** - Helper functions and tools
5. **Content Layer** - Markdown files for dynamic content

---

## Component Layer

### Location: `src/components/`

Astro components are responsible for rendering UI and handling presentation logic. They consume services for interactive behavior.

### Component Patterns

#### Props Interface

All components define props interfaces in `src/types/`:

```astro
---
import type { MyComponentProps } from "../types/component.types";

const { prop1, prop2 } = Astro.props as MyComponentProps;
---
```

#### CSS Class Composition

Styles are composed using template literals:

```astro
const baseClasses = "base-styles"; const sizeClasses = isMobile ?
"mobile-styles" : "desktop-styles"; const colorClasses = isActive ?
"active-color" : "inactive-color"; const classes = `${baseClasses}
${sizeClasses} ${colorClasses}`;
```

#### Data Attributes for Testing

Components include `data-testid` attributes for E2E testing:

```html
<div data-testid="mobile-menu-backdrop"></div>
```

#### Conditional Rendering

Use ternary operators for simple conditions:

```astro
{isActive ? <ActiveContent /> : <InactiveContent />}
```

### Client-Side Scripts

Components that need interactivity include a `<script>` tag:

```astro
<script>
  document.addEventListener("DOMContentLoaded", () => {
    import("../services/my-service/index.js")
      .then(({ createMyService }) => {
        const service = createMyService(config);
        service.initialize();

        window.addEventListener("beforeunload", () => {
          service.destroy();
        });
      })
      .catch((error) => {
        console.error("[Component] Failed to load service:", { error });
      });
  });
</script>
```

**Key Points**:

- Services are loaded dynamically to reduce initial bundle size
- Cleanup happens in `beforeunload` event listener
- Errors are caught and logged with context
- Services are initialized only after DOM is ready

### Component Categories

#### Page Sections

- `Header.astro` - Site navigation and mobile menu trigger
- `Footer.astro` - Site footer with navigation links
- `Hero.astro` - Landing page hero section
- `About.astro` - About section
- `Projects.astro` - Projects showcase
- `Blog.astro` - Blog listing
- `Contact.astro` - Contact section
- `Prose.astro` - Content prose for markdown rendering

#### Reusable Components

- `buttons/FilledButton.astro` - Primary CTA button
- `buttons/OutlineButton.astro` - Secondary button
- `NavLink.astro` - Navigation link with active state
- `MobileMenu.astro` - Mobile navigation menu
- `ScrollAnimation.astro` - Scroll animation service loader
- `Marquee.astro` - Scrolling text animation

#### Utility Components

- `Metatags.astro` - SEO metadata
- `FontConfiguration.astro` - Font loading setup

---

## Service Layer

### Location: `src/services/`

Services encapsulate business logic and DOM interactions. They use a factory function pattern.

### Service Structure

Each service follows this directory structure:

```
service-name/
├── config.ts       # Constants and configuration
├── types.ts        # Service-specific types
├── service.ts      # Main service implementation
├── index.ts        # Public API exports
└── __tests__/      # Service tests
    ├── service.test.ts
    └── validation.test.ts
```

### Factory Function Pattern

All services use a factory function:

```ts
export function createService(config: Config): Service {
  const logger = createLogger("ServiceName");
  let observer: SomeObserver | null = null;

  const initialize = () => {
    try {
      logger.info("Initializing service");
      // initialization logic
    } catch (error) {
      logger.error("Initialization failed", { error });
      throw new ServiceInitializationError(
        "ServiceName",
        "Failed to initialize",
        error
      );
    }
  };

  const destroy = () => {
    try {
      // cleanup logic
      observer?.disconnect();
      logger.info("Service destroyed");
    } catch (error) {
      logger.error("Cleanup failed", { error });
    }
  };

  return { initialize, destroy };
}
```

### Lifecycle Methods

Every service implements:

- `initialize()` - Sets up observers, event listeners, and state
- `destroy()` - Cleans up observers, listeners, and resources

**Important**: `destroy()` must remove ALL event listeners and observers added in `initialize()`.

### Error Handling

Services use custom error types from `src/errors/types.ts`:

- `ServiceInitializationError` - Service setup failures
- `DOMElementNotFoundError` - Missing required DOM elements
- `ConfigurationError` - Invalid configuration values
- `ObserverError` - IntersectionObserver/ResizeObserver failures

#### Error Handling Pattern

```ts
try {
  if (!config.requiredField) {
    throw new ConfigurationError("Required field missing");
  }

  // service logic
} catch (error) {
  logger.error("Operation failed", { error });
  throw new SpecificError(context, message, error);
}
```

### Logging

Services use the logger utility from `src/utils/logger.ts`:

```ts
const logger = createLogger("ServiceName");

logger.info("Operation started", { data: "value" });
logger.warn("Unexpected situation", { context });
logger.error("Operation failed", { error });
logger.debug("Detailed info", { details });
```

All logs include context data and timestamps.

### Service Examples

#### Navigation Service

- **Purpose**: Tracks active section and updates navigation links
- **Dependencies**: IntersectionObserver, scroll event listener
- **Cleanup**: Disconnects observer, removes scroll listener

#### Mobile Menu Service

- **Purpose**: Controls mobile menu open/close state
- **Dependencies**: DOM elements, event listeners
- **Cleanup**: Removes all click/keyboard listeners

#### Scroll Animation Service

- **Purpose**: Animate elements as they enter viewport
- **Dependencies**: IntersectionObserver, DOMContentLoaded event
- **Cleanup**: Disconnects observer, removes DOMContentLoaded listener

#### Blog Search Service

- **Purpose**: Search and filter blog posts
- **Dependencies**: Input element event listeners
- **Cleanup**: Removes input event listener, debounced function

---

## Type Layer

### Location: `src/types/`

Type definitions provide contracts and enable type safety across the codebase.

### Type Organization

#### Shared Types (`shared.types.ts`)

Base interfaces used across multiple services:

```ts
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
```

#### Component-Specific Types

Each component category has its own types file:

- `header.types.ts` - Header, Footer, NavLink, MobileMenu props
- `layout.types.ts` - Layout component props

### Type Guidelines

- Define interfaces in dedicated files
- Export type definitions separately from implementations
- Use `as const` for constant objects that won't change
- Provide explicit type annotations for function parameters and return types
- Use optional properties (`?`) for optional configuration

---

## Utility Layer

### Location: `src/utils/`

Utilities provide reusable helper functions.

### Logger (`logger.ts`)

Scoped logging utility:

```ts
const logger = createLogger("ContextName");
logger.info("Message", { contextData });
```

**Methods**:

- `info()` - Informational messages
- `warn()` - Warning messages
- `error()` - Error messages
- `debug()` - Debug messages

All logs include timestamp and context.

### Date Utilities (`date.ts`)

Date formatting and manipulation helpers.

### Adding New Utilities

1. Create utility function in `src/utils/`
2. Add unit tests in `src/utils/__tests__/`
3. Export from utility file or create an index.ts

---

## Page Script Boundaries

### Script Loading Patterns

Page scripts follow these conventions:

#### Dynamic Service Loading

Services are loaded dynamically to improve performance:

```ts
import("../services/my-service/index.js")
  .then(({ createMyService }) => {
    // initialize
  })
  .catch((error) => {
    // handle error
  });
```

#### DOM Ready Check

Always wait for DOM to be ready:

```ts
document.addEventListener("DOMContentLoaded", () => {
  // service initialization
});
```

#### Cleanup on Unload

Cleanup services when page unloads:

```ts
window.addEventListener("beforeunload", () => {
  service.destroy();
});
```

### Event Listener Best Practices

1. **Store Listener References**: Keep references to remove them later
2. **Remove in destroy()**: Always clean up listeners in destroy method
3. **Use Passive Listeners**: For scroll/touch events when possible
4. **Debounce Expensive Handlers**: Use debounce for input/resize events

### Error Boundaries

All service loading is wrapped in try-catch:

```ts
try {
  const service = createService(config);
  service.initialize();
} catch (error) {
  console.error("[Component] Failed to initialize service:", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
```

---

## Data Flow

### Page Initialization Flow

1. **Astro Builds HTML**: Server-side renders components to HTML
2. **Page Loads**: Browser receives static HTML
3. **DOMContentLoaded Fires**: Page scripts execute
4. **Services Load**: Services are dynamically imported
5. **Services Initialize**: Services set up observers and listeners
6. **User Interacts**: DOM events trigger service methods
7. **Services Respond**: Services update DOM state
8. **Page Unloads**: Services clean up in beforeunload

### Component → Service Communication

```astro
<!-- Component Template -->
<div id="my-element">Content</div>

<script>
  // Component Script
  document.addEventListener("DOMContentLoaded", () => {
    import("../services/my-service/index.js").then(({ createMyService }) => {
      const element = document.getElementById("my-element");
      const service = createMyService({ element });
      service.initialize();
    });
  });
</script>
```

### Service → DOM Interaction

Services directly manipulate DOM elements passed via configuration:

```ts
const updateElement = () => {
  config.element.classList.add("active");
  config.element.setAttribute("aria-expanded", "true");
};
```

---

## Conventions and Best Practices

### Code Style

- No comments unless explicitly requested
- Use `const` by default, `let` only when reassignment needed
- Prefer template literals over string concatenation
- Use arrow functions for callbacks
- Destructure objects and arrays

### TypeScript

- Enable strict mode (already configured)
- Avoid `any` type
- Use `unknown` instead of `any` for unknown types
- Provide type annotations for function parameters
- Use `as` assertions sparingly

### Performance

- Lazy load services with dynamic imports
- Use IntersectionObserver for scroll-based triggers
- Debounce expensive event handlers
- Clean up listeners and observers
- Respect `prefers-reduced-motion` preference

### Accessibility

- Use semantic HTML elements
- Include ARIA attributes (aria-label, aria-expanded, aria-controls)
- Support keyboard navigation (handle Escape key)
- Manage focus for modals/menus
- Use `role` attributes appropriately

### Testing

- Unit tests for services with Vitest and happy-dom
- E2E tests with Playwright
- Test files named `*.test.ts` (unit) or `*.spec.ts` (E2E)
- Clean up resources in tests (call destroy() methods)
- Mock DOM elements with `document.createElement()`

---

## Adding New Features

### Adding a New Component

1. Create component in `src/components/`
2. Define props interface in `src/types/`
3. Implement component template and styles
4. Add E2E test in `e2e/` directory
5. Update AGENTS.md if component introduces new patterns

### Adding a New Service

1. Create service directory in `src/services/`
2. Define service-specific types
3. Implement factory function with initialize/destroy
4. Add configuration constants
5. Write unit tests in `__tests__/`
6. Export from `index.ts`
7. Update AGENTS.md if service introduces new patterns

### Adding New Types

1. Determine if types are shared or component-specific
2. Create types file in appropriate directory
3. Export interfaces and types
4. Update imports in components/services

---

## Summary

This architecture provides:

- **Separation of Concerns**: Clear boundaries between components, services, and types
- **Testability**: Services can be tested independently with mocked DOM
- **Maintainability**: Consistent patterns and conventions throughout codebase
- **Performance**: Lazy loading, cleanup, and optimized interactions
- **Accessibility**: ARIA support, keyboard navigation, and semantic HTML
- **Type Safety**: Strict TypeScript with comprehensive type definitions

For more implementation details, see the individual service and component files.
