# edwrd.dev

Personal portfolio website built with Astro, featuring a modern dark theme, smooth scroll animations, and responsive design.

## Tech Stack

- **Framework**: Astro 5.x - Static site generator with component islands
- **Language**: TypeScript - Type-safe development
- **Styling**: Tailwind CSS 4.x - Utility-first CSS framework
- **Testing**:
  - Vitest - Unit testing with happy-dom
  - Playwright - End-to-end testing
- **Icons**: astro-icon - Icon component system
- **Fonts**: astro-font - Font optimization and loading

## Project Structure

```
src/
├── components/       # Reusable Astro components
│   ├── buttons/     # Button components (FilledButton, OutlineButton)
│   └── *.astro      # Page sections (Header, Footer, Hero, etc.)
├── services/        # Business logic layer
│   ├── navigation/    # Active section tracking
│   ├── mobile-menu/  # Mobile menu interactions
│   ├── scroll-animation/  # IntersectionObserver animations
│   └── blog-search/      # Blog post search/filter
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (logger, date helpers)
├── content/         # Markdown content (blog posts, projects)
└── pages/           # Route definitions
```

## Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

### Build for Production

```bash
npm run build
```

Build artifacts are output to `./dist/`

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run Unit Tests (Watch Mode)

```bash
npm run test
```

### Run Unit Tests Once

```bash
npm run test:run
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run All Checks

```bash
npm run test:all
```

This runs lint, format, unit tests, and E2E tests.

## Code Quality

### Lint Code

```bash
npm run lint
```

### Auto-fix Lint Issues

```bash
npm run lint:fix
```

### Format Code

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

## Content Management

### Blog Posts

Blog posts are Markdown files in `src/content/blog/`. Each post requires frontmatter:

```yaml
---
title: "Post Title"
description: "Post description"
publishDate: 2024-01-01
tags: ["tag1", "tag2"]
---
```

### Projects

Projects are Markdown files in `src/content/projects/`. Each project requires frontmatter:

```yaml
---
title: "Project Name"
description: "Project description"
tech: ["Tech1", "Tech2"]
link: "https://github.com/user/repo"
---
```

## Architecture

The codebase follows a layered architecture:

- **Components**: Presentation logic and UI structure
- **Services**: Business logic and DOM interaction (factory pattern)
- **Types**: Shared TypeScript interfaces and contracts
- **Utils**: Reusable helper functions

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Key Features

- **Smooth Scroll Animations**: Elements animate as they enter viewport
- **Active Navigation**: Navigation highlights current section
- **Mobile Menu**: Responsive hamburger menu for mobile devices
- **Dark Theme**: Modern dark color scheme with brand accents
- **Blog Search**: Search and filter blog posts
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Performance**: Optimized fonts, lazy loading, and static generation

## Deployment

The site is designed for static hosting. After building:

```bash
npm run build
```

Deploy the `dist/` directory to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Browser Support

Modern browsers with ES6 support:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
