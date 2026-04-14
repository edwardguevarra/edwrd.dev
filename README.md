# edwrd.dev

Personal site and blog built with [Astro](https://astro.build), Tailwind CSS v4, and TypeScript.

## Stack

- **Astro 6** — static site generation
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **TypeScript** (strict)
- **Vitest** + **happy-dom** for unit tests
- **Playwright** for E2E

## Getting started

```sh
npm install
npm run dev
```

Dev server runs at http://localhost:4321.

## Commands

| Command                           | Action                                       |
| :-------------------------------- | :------------------------------------------- |
| `npm run dev`                     | Start dev server                             |
| `npm run build`                   | Build to `./dist/`                           |
| `npm run preview`                 | Preview the production build                 |
| `npm run lint` / `lint:fix`       | ESLint                                       |
| `npm run format` / `format:check` | Prettier                                     |
| `npm run test` / `test:run`       | Unit tests (watch / one-shot)                |
| `npm run test:coverage`           | Unit tests with v8 coverage (100% threshold) |
| `npm run test:e2e`                | Playwright end-to-end tests                  |

## Project structure

```
src/
├── components/        Reusable Astro components
├── content/           Blog posts + projects (Markdown)
├── errors/            Shared error types
├── pages/             Routes
├── services/          Client-side business logic (factory-function services)
├── styles/            Global CSS
├── types/             Shared TypeScript contracts
└── utils/             Logger, date helpers
```

See [AGENTS.md](./AGENTS.md) for the full style guide, service pattern, and conventions.

## Content

- Blog posts: `src/content/blog/*.md`
- Projects: `src/content/projects/*.md`
- Schemas: `src/content.config.ts`
