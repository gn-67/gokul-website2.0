# CLAUDE.md

## Project Overview

2D free-roam personal portfolio website. User lands on a central Home screen and navigates in cardinal directions to reach other sections. Navigation uses Framer Motion AnimatePresence slide transitions (not native scroll) to support infinite loop navigation with wrapping and perpendicular targets.

## Grid Layout

```
            About Me (0,-1)

Experiences HOME (0,0)    Work (1,0)
(-1,0)
            Life & Photos (0,1)
```

> **Code-level labels differ from display names.** In `useNavStore.ts`: Work → id `dev`, label `WORK`; Experiences → id `design`, label `STUDIO`.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 8
- **State:** Zustand (useNavStore)
- **Animation:** Framer Motion (AnimatePresence slide transitions)
- **Styling:** CSS Modules
- **No React Router** — navigation is spatial/scroll-based, not URL-based

## Commands

- `npm run dev` — start dev server
- `npm run build` — typecheck + production build (`tsc -b && vite build`)
- `npm run lint` — run ESLint
- `npm run preview` — preview production build

## Project Structure

```
src/
  App.tsx              — root component
  main.tsx             — entry point
  index.css            — global styles
  store/
    useNavStore.ts     — Zustand store tracking active screen position
  components/
    World/             — world container, grid layout
    Screen/            — individual screen wrapper
    HomeScreen/        — home screen content
    AboutScreen/       — about me screen
    NavHint/           — navigation direction hints
    SplitFlap/         — split-flap display component
    LoadingScreen/     — loading/splash screen
```

## Current Status

See ROADMAP.md for phase breakdown. The project is past Phase 1 (navigation shell) and in Phase 2 (loading screen + asset preloading). Phase 3 (beach MP4 background) is deferred pending assets.

## Key Architecture Decisions

- Framer Motion AnimatePresence over native scroll — infinite loop navigation requires screens that aren't physically adjacent
- No SSR (no Next.js) — static portfolio site
- Mobile/touch support deferred to Phase 9

## Placeholder Image Pattern

All screens should use reusable `<PlaceholderImage />` components for images until real assets are provided. These should be easily swappable when real photos/assets arrive.

## Life & Photos Direction

The Life & Photos screen should have a scrapbook/collage aesthetic — scattered/rotated photos, tape/pin decorations, handwritten-style labels. Not a clean grid; organic and layered like a physical scrapbook or pinboard.
