# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Astro 5, featuring a modern single-page design with scroll-based navigation, animated sections, and a separate blog system. The site uses Tailwind CSS v4 for styling and includes custom TypeScript configurations for content management.

## Available Commands

- `npm run dev` - Start local development server at `localhost:4321`
- `npm run build` - Build production site to `./dist/`
- `npm run preview` - Preview build locally
- `npm run astro ...` - Run Astro CLI commands

**Note**: Never run `npm run dev` - assume it's already running during development sessions.

## Architecture & Structure

### Core Architecture
- **Astro 5** with static site generation
- **Component-based** architecture using `.astro` files
- **Content Collections** for structured data (projects and blog posts)
- **TypeScript** for type safety and configuration

### Key Directories
- `src/pages/` - Route definitions (homepage and blog pages)
- `src/components/` - Reusable Astro components
- `src/content/` - Content collections (projects and blog posts)
- `src/config/` - Configuration files (navigation)
- `src/utils/` - Utility functions

### Content Management System
The project uses Astro Content Collections with TypeScript schemas:

- **Projects**: Located in `src/content/projects/` with schema requiring title, description, image, link, and alt text
- **Blog**: Located in `src/content/blog/` with schema requiring title, description, date, author, tags, and featured images

### Navigation System
Dynamic navigation handled through `src/config/navigation.ts`:
- Automatically computes hrefs based on current page context
- Handles both homepage (hash-based) and separate pages
- Special logic for blog section navigation

### Component Architecture

#### Main Layout (`src/pages/index.astro`)
- Single-page application with scroll-based sections
- Includes accessibility features (skip navigation, reduced motion support)
- Implements custom IntersectionObserver for scroll animations
- Respects user's motion preferences via `prefers-reduced-motion`

#### Header Component (`src/components/Header.astro`)
- Responsive navigation with mobile menu
- Intersection Observer for active section highlighting
- Mobile-first design with desktop enhancement
- Complex state management for menu toggle and scroll behavior

#### Content Components
- `Hero.astro` - Landing section
- `About.astro` - Personal information
- `Projects.astro` - Portfolio showcase (populated from content collection)
- `Contact.astro` - Contact information
- `Blog.astro` - Blog preview section
- `Footer.astro` - Site footer

#### Shared Components
- `Button.astro` - Consistent button styling across the site
- `Metatags.astro` - SEO meta tags
- `FontConfiguration.astro` - Typography settings

### Styling System
- **Tailwind CSS v4** with custom color scheme:
  - `brand-dark` - Primary dark background
  - `brand-lime` - Accent color (lime green)
- Global CSS animations in `src/styles/global.css`
- Animation classes applied via data attributes and JavaScript

### Icon System
Uses `astro-icon` with Heroicons (`@iconify-json/heroicons`) for consistent iconography.

## Development Notes

### Content Adding
- Projects: Add markdown files to `src/content/projects/` following the schema
- Blog posts: Add markdown files to `src/content/blog/` with proper frontmatter

### Animation System
- Elements use `data-animate` attribute for scroll animations
- IntersectionObserver-based with respect for reduced motion preferences
- Animation states managed through CSS classes

### Mobile Responsiveness
- All components implement mobile-first design
- Header includes complex mobile menu with backdrop and animations
- Navigation adapts between scroll-based (homepage) and link-based navigation

### TypeScript Integration
- Content schemas provide type safety for markdown content
- Navigation configuration typed with interfaces
- Date utilities for blog post formatting

The codebase follows modern web development practices with emphasis on accessibility, performance, and user experience.