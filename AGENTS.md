# AGENTS.md — Corphy Personal Page

Instructions for AI agents working on this repository.

## Project

Personal landing page for **Corphy (蝦蝦)**, an AI agent powered by Hermes.
Static site built with Astro, deployed to GitHub Pages.

- **URL:** https://corphysha.github.io/corphy-page/
- **Repo:** https://github.com/corphysha/corphy-page

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Astro | ^6.4.8 | Static site generator |
| TypeScript | — | Language (strictest mode) |
| Bun | ^1.3 | Package manager & runtime |
| Biome.js | ^2.5 | Linting & formatting |
| Zod | ^4.4 | Schema validation |
| Husky | ^9.1 | Git hooks |
| lint-staged | ^17.0 | Pre-commit checks |

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Dev server (http://localhost:4321)
bun run build        # Production build → dist/
bun run preview      # Preview production build
bun run check        # Biome check + auto-fix
bun run check:ci     # Biome strict CI check (no auto-fix)
bun run lint         # Lint only
bun run format       # Format only
```

## Conventions

### Git Commits

- **Conventional Commits** format: `type(scope): message`
- **Minimal, focused commits** — one logical change per commit
- Split by topic: separate commits for deps, CI, docs, fixes, features
- Examples: `chore: add husky`, `ci: add biome workflow`, `fix(ci): strict check`

### Code Style

- Biome.js enforces all formatting & linting rules (see `biome.json`)
- Double quotes, semicolons, trailing commas
- TypeScript strictest mode (`astro/tsconfigs/strictest`)
- `.astro` files: unused import/variable rules disabled (false positives in template)

### Pre-commit

- Husky + lint-staged run Biome automatically on staged files
- `.js/.ts/.mjs/.cjs` → `biome check --write`
- `.astro/.css/.json/.md` → `biome format --write`

## Architecture

```
corphy-page/
├── src/
│   ├── pages/index.astro      # Main landing page (all sections)
│   ├── layouts/Layout.astro    # HTML shell + meta tags
│   ├── styles/global.css       # Design system + animations
│   ├── content.config.ts       # Zod content schemas
│   └── assets/                 # Static assets
├── public/                     # Public files (favicon, OG image)
├── .github/workflows/
│   ├── deploy.yml              # Build + deploy to GitHub Pages
│   └── biome.yml               # Strict Biome CI check
├── astro.config.mjs            # Astro config (site, base, build)
├── biome.json                  # Biome config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies + scripts
```

## CI/CD

- **biome.yml** — Runs on push/PR to main. Strict `biome ci` — fails on violations.
- **deploy.yml** — Builds with `bun run build`, deploys to GitHub Pages. Biome check must pass first.
- Both workflows use `oven-sh/setup-bun@v2`.

## Design

- Dark ocean/space theme with Corphish orange (#ff6b35) and teal (#00d4aa) accents
- CSS animations: floating particles, pulse dots, gradient text
- View Transitions API enabled
- Responsive (mobile-first with breakpoints at 768px)
- Fonts: Inter + JetBrains Mono via Bunny Fonts
