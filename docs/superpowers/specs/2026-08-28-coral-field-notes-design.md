# Coral Field Notes Design

**Date:** 2026-08-28  
**Status:** Approved direction, pending written-spec review

## Design read

A personal AI agent portfolio and technical notes site for technical readers. The experience should feel like a maintained field notebook: deliberate, easy to scan, and enjoyable to read for long sessions. It uses a custom Astro design system, Fumadocs-inspired information architecture, and one purposeful ReactBits client island rather than a generic marketing template.

## Design dials

- **DESIGN_VARIANCE:** 7. Legible information architecture with an asymmetric editorial entry point and a distinct typographic signature.
- **MOTION_INTENSITY:** 5. Motion establishes hierarchy and tactile feedback. It never becomes ambient decoration.
- **VISUAL_DENSITY:** 4. Blog pages favor reading comfort; indexes carry enough metadata to navigate without dashboard density.

## Visual contract

### Palette

| Token | Value | Purpose |
| --- | --- | --- |
| Void | #0D1117 | Page background |
| Graphite | #171B22 | Raised reading surfaces |
| Slate | #29313D | Rules and quiet structural detail |
| Mist | #E8EDF1 | Primary type |
| Ash | #9AA5B1 | Secondary type and captions |
| Corphish coral | #FF6B3D | The sole accent for focus, links, and meaningful interaction |

The page uses one dark theme with a single coral accent. There will be no teal secondary accent, AI-purple gradient, decorative status dots, or neon glow system.

### Typography

- **Display:** Space Grotesk variable, for the home-page thesis and editorial headings.
- **Reading:** Manrope variable, for body copy and metadata.
- **Utility:** JetBrains Mono, for code, tags, route context, and concise technical labels.

All fonts will be self-hosted through Fontsource with font-display: swap.

### Signature element

The home-page thesis uses the official ReactBits SplitText-TS-CSS component. It is an Astro React island loaded only when visible. The animation is a single word-level introduction to the site's purpose; reduced-motion users receive the same semantic text without split animation.

## Scope and preserved behavior

The rewrite preserves:

- all existing MDX posts, tags, RSS feed, static routes, and GitHub Pages deployment
- article code highlighting and the code-copy action
- the existing WebGPU demonstration and its graceful fallback
- the current base URL /corphy-page/

The rewrite fixes visible content drift, including outdated framework references in static copy and README text.

## Information architecture

### Shared shell

- Skip-to-content link, compact one-line top navigation, and clear active-route state.
- Navigation destinations: home, field notes, RSS, and GitHub.
- A restrained footer with only real destinations. No filler link farm.

### Home

1. **Editorial hero:** a short thesis, ReactBits text reveal, concise supporting sentence, and two real actions.
2. **Current field note:** one most-recent article as the primary entry, followed by a quiet chronological index of recent notes.
3. **Working practice:** a non-card-heavy, asymmetric explanation of Corphy's actual working modes: build, investigate, ship, and care.
4. **Tooling context:** a compact, horizontally resilient technology index with actual technologies only.

The current collection of equal feature cards and fake-looking statistics is removed.

### Blog index and tag pages

- A Fumadocs-inspired reading index with a primary post stream, dated metadata, readable excerpts, tag links, and a lightweight topic index.
- Empty-state copy stays helpful and specific.
- The desktop layout uses a durable central content measure. Tablet and mobile collapse to one reading column without horizontal overflow.

### Article pages

- Semantic article structure with an accessible back link.
- Desktop grid: modest context rail, reading column, and a sticky on-this-page table of contents generated from actual post headings.
- Mobile: one column, with table of contents moved above the article content.
- Code blocks retain horizontal scrolling, comfortable insets, and a keyboard-accessible Copy / Copied control.
- Adjacent article navigation is derived from real chronological posts, not static placeholders.

### 404 page

A concise branded missing-page route with routes back to the home page and field notes.

## Technical architecture

### ReactBits integration

- Add Astro's official React integration.
- Add only the React runtime and GSAP dependencies needed by the ReactBits SplitText-TS-CSS component.
- Copy the official component source into a dedicated src/components/reactbits/ boundary and document its ReactBits provenance.
- Keep React in small client islands. The static Astro layout, MDX collection, navigation, and article rendering remain server-rendered.
- Load the motion island with client:visible to protect first render and initial bundle cost.

### New or revised project modules

- src/components/reactbits/SplitText.tsx: official ReactBits-derived text animation with safe lifecycle cleanup.
- src/components/HeroTitle.tsx: accessibility and reduced-motion wrapper around the ReactBits component.
- src/components/SiteHeader.astro, SiteFooter.astro, ArticleList.astro, TableOfContents.astro, CodeCopyButton.astro: focused presentation modules.
- src/lib/blog.ts: shared post sorting, reading-time calculation, adjacent-post lookup, and tag helpers.
- Revised Layout.astro, BlogPostLayout.astro, home, blog index, tag page, and article route.
- Rewritten global and blog styles around one token system.
- src/pages/404.astro.
- Playwright configuration and browser tests.

## Responsive and accessibility contract

| Viewport | Required behavior |
| --- | --- |
| 1440px | Editorial grid with navigation, article rails, readable 68ch content column, no stretched prose |
| 768px | Two-column or single-column transition with no clipped navigation, content, tags, or code |
| 390px | One column, 16px minimum side inset, visible tap targets, no horizontal document overflow, TOC appears before article content |

Additional requirements:

- 100dvh only where a full-viewport block is actually needed; never a brittle 100vh hero.
- Keyboard-visible focus state, semantic landmarks, real link destinations, and aria-current navigation state.
- All meaningful images retain descriptive alt text.
- Every animation respects prefers-reduced-motion.
- The page maintains contrast appropriate for WCAG AA.
- No manual SVG icon paths are added; textual controls are used where an icon is not essential.

## Dependencies and quality gates

All new packages will be installed with Bun at their latest compatible release, then the full tree will be checked with:

~~~bash
bunx npm-check-updates --deep -u
bun update
bun run check:ci
bun run build
bunx astro check
bunx playwright test
~~~

Planned additions:

- @astrojs/react, react, react-dom
- gsap, @gsap/react
- @fontsource-variable/space-grotesk, @fontsource-variable/manrope
- @playwright/test, @axe-core/playwright, @types/react, @types/react-dom

## Browser and test acceptance criteria

1. Build, Biome CI, Astro diagnostics, and Playwright suite exit successfully with no warnings or errors.
2. Playwright covers home, blog index, tag listing, every generated post route, RSS, and 404.
3. The suite checks responsive layout at 390px, 768px, and 1440px; asserts no horizontal overflow; captures console errors and page errors; verifies keyboard focus, real navigation, code copy behavior, and reduced-motion behavior.
4. Browser inspection verifies visual hierarchy and interaction at the same three viewport classes.
5. A subagent reviews each implementation task for specification compliance and code quality, then reviews the full integration before merge.

## Risks and mitigation

- **ReactBits motion cost:** isolate it to a single client:visible island and use one component only.
- **GSAP lifecycle leaks after Astro navigation:** ensure the component cleanup runs and test navigation forwards and backwards.
- **Long article layout:** use actual headings and MDX content in browser tests, not short fixture-only pages.
- **GitHub Pages paths:** preserve base: /corphy-page and test generated URLs with the base path in production preview.
