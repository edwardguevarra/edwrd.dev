# AGENTS.md

This file provides guidance to agentic coding agents working in this repository.

## Commands

### Build & Quality

- `npm run build` - Build production site to `./dist/`
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run Vitest once
- `npm run test:ui` - Run Vitest with UI
- `npm run test -- <path>` - Run single test file (e.g., `npm run test src/services/navigation/__tests__/service.test.ts`)
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run Playwright with UI

### Development

- `npm run dev` - Start dev server (assume already running during sessions)
- `npm run preview` - Preview production build

## Code Style Guidelines

### Formatting

- **Prettier config**: 80 character width, double quotes, 2-space tabs, ES5 trailing commas
- **Plugins**: prettier-plugin-astro, pretttier-plugin-tailwindcss
- Run `npm run lint` and `npm run format` before committing

### Imports

- Use `import type { ... }` for type-only imports
- Group imports: external libraries → internal modules → relative paths
- Named imports preferred over default imports

### Types

- **Strict TypeScript** enabled (extends `astro/tsconfigs/strict`)
- Define interfaces in dedicated files in `src/types/`
- Use `as const` for constant objects that won't change
- Explicit type annotations for function parameters and return types
- Type definitions exported separately from implementations

### Naming Conventions

- **Components**: PascalCase (e.g., FilledButton.astro, NavLink.astro)
- **Services**: camelCase factory functions (e.g., createNavigationService)
- **Constants**: UPPER_SNAKE_CASE (e.g., SECTION_IDS, LINK_CLASSES)
- **Functions**: camelCase (e.g., getNavigationItems, computeHref)
- **Interfaces**: PascalCase (e.g., NavigationItem, NavLinkProps)

### Architecture Patterns

#### Service Layer

Services use factory function pattern:

```ts
export function createService(config: Config): Service {
  const initialize = () => { ... };
  const destroy = () => { ... };
  return { initialize, destroy };
}
```

- Services located in `src/services/`
- Each service has dedicated types file in `src/types/`
- Clean up event listeners and observers in `destroy()`
- Return object defines public interface

#### Component Patterns

- Astro components use frontmatter for props extraction
- CSS classes composed as: `${baseClasses} ${sizeClasses} ${colorClasses}`
- Conditional rendering with ternary operators
- Props typed with interfaces from `src/types/`
- Use `data-testid` attributes for testability

### Error Handling

- **Custom error types** in `src/errors/types.ts`:
  - `ServiceInitializationError` - service initialization failures
  - `DOMElementNotFoundError` - missing required DOM elements
  - `ConfigurationError` - invalid configuration values
  - `ObserverError` - IntersectionObserver operation failures

- **Logging utility** in `src/utils/logger.ts`:
  - Use `createLogger(context)` to create a scoped logger
  - Methods: `info()`, `warn()`, `error()`, `debug()`
  - All logs include context data and timestamp

- **Service error handling pattern**:

  ```ts
  export function createService(config: Config): Service {
    const logger = createLogger("ServiceName");

    // Validate required inputs
    if (!config.requiredField) {
      throw new ConfigurationError("Required field missing");
    }

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
        logger.info("Service destroyed");
      } catch (error) {
        logger.error("Cleanup failed", { error });
      }
    };

    return { initialize, destroy };
  }
  ```

- **Component error boundary pattern**:

  ```ts
  import("../services/service.js")
    .then(({ createService }) => {
      const service = createService(config);
      service.initialize();
    })
    .catch((error) => {
      console.error("[ComponentName] Failed to load service:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  ```

- **Optional vs required elements**:
  - Required: Throw `DOMElementNotFoundError` if missing
  - Optional: Log warning and continue, use optional chaining `?.`

- **Observer operations**: Wrap in try-catch with `ObserverError`

### Testing

- **Vitest** with happy-dom environment, globals enabled
- Test files: `*.test.ts` in `__tests__` directories or alongside source
- E2E tests in `e2e/` directory with `*.spec.ts` naming
- Use `vi.spyOn`, `vi.mocked`, and `expect` from Vitest
- Clean up resources in tests (call destroy() methods)
- Mock DOM elements with `document.createElement()`

### Project Structure

```
src/
├── components/         # Reusable Astro components
│   └── buttons/       # Component subdirectories
├── services/          # Business logic layer
│   └── navigation/    # Feature-specific services
│       ├── config.ts  # Constants and utilities
│       ├── service.ts # Main service implementation
│       ├── types.ts   # Service-specific types
│       └── __tests__/ # Service tests
├── types/             # Shared type definitions
├── utils/             # Utility functions
└── pages/             # Route definitions
```

### Accessibility

- Use semantic HTML elements
- Include ARIA attributes: `aria-label`, `aria-expanded`, `aria-controls`
- Support keyboard navigation (handle Escape key)
- Focus management for modals/menus
- Use `role` attributes appropriately

### Best Practices

- **No comments** in code unless explicitly requested
- Always check for existing patterns before creating new ones
- Maintain separation: services (logic), components (UI), types (contracts)
- Use TypeScript `as` assertions sparingly and only when necessary
- Respect user preferences (e.g., `prefers-reduced-motion`)
- Mobile-first responsive design
- Run lint and format commands after changes

### Content Management

- Projects: Markdown files in `src/content/projects/`
- Blog posts: Markdown files in `src/content/blog/`
- Content schemas defined in `src/content.config.ts`
- Follow existing frontmatter patterns for new content
