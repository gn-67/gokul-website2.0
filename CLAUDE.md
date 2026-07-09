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
- **Styling:** CSS Modules + design tokens (`:root` vars in `src/index.css`)
- **Fonts:** Cooper Light BT (self-hosted TTF, global @font-face in index.css), Caveat (handwritten, `@fontsource/caveat`)
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
  main.tsx             — entry point (imports Caveat font css)
  index.css            — global styles + design tokens (:root vars) + @font-face
  store/
    useNavStore.ts     — Zustand store: NAVIGATION_MAP, active screen, nav hints
  hooks/
    useScrambleText.ts — scramble-reveal text animation (shared)
  data/
    projects.ts        — Work screen content ([bracketed] placeholders)
    experiences.ts     — Studio timeline + creative shelf content
    lifePhotos.ts      — Life scrapbook photos/captions/positions
  components/
    World/             — navigation engine (wheel/keys, SCREEN_COMPONENTS map)
    Screen/            — generic fallback screen for unmapped ids
    HomeScreen/        — split-flap name + live clock
    AboutScreen/       — parallax profile card, scramble greeting, bio
    WorkScreen/        — project showcase (master-detail, 2×2 card grid)
    StudioScreen/      — experience timeline + creative shelf
    LifeScreen/        — scrapbook collage (polaroids, tape/pins)
    NavHint/           — navigation direction hints (hover scramble)
    SplitFlap/         — split-flap display component
    LoadingScreen/     — real asset preloading (fonts + images + video posters) + fade
    PlaceholderImage/  — swappable image placeholder (photo/screenshot/polaroid)
    OceanBackground/   — fixed layer of synced looping bg videos (two sets: halftone + ocean)
    ModeDial/          — amp-style corner knob mixing halftone/ocean background sets
  assets/ocean/        — two seamless five-tile video sets + posters: ocean-* (color,
                         from ocean.blend) and halftone-* (B&W, AE Card Dance rig in
                         C:\Users\gokul\Documents\halftone.aep)
scripts/ocean-render/  — Blender headless pipeline that produced them (see its README)
```

## Current Status

All five screens are built with the seamless ocean video background wired in (see ROADMAP.md). Remaining deferred work:
- **Phase 9 mobile** — touch/swipe navigation and responsive layouts (desktop experience is locked in first)
- **Content** — all copy/images are `[bracketed]` placeholders in `src/data/*.ts`, ready to swap for real content

## Key Architecture Decisions

- Framer Motion AnimatePresence over native scroll — infinite loop navigation requires screens that aren't physically adjacent
- Screens are registered in `SCREEN_COMPONENTS` in `World.tsx`; unmapped ids fall back to the generic `<Screen>`
- Screens are one non-scrolling viewport each — no inner scroll regions (they'd fight wheel navigation)
- Screens remount on every navigation, so entry animations use ~0.3s delays to land as the 0.6s slide settles
- No SSR (no Next.js) — static portfolio site
- Mobile/touch support deferred to Phase 9
- Ocean background: five video tiles sliced from ONE 5760×3240 Blender render per frame — separate renders can never seam (screen-space glare/reflections). The `OceanBackground` layer keeps all `<video>`s mounted forever (remount = loop-clock reset = broken seams mid-slide); screens are transparent; readability comes from one uniform scrim, never per-screen tints (those paint a visible edge at the seam). Re-render via `scripts/ocean-render/`.
- Two background sets, `halftone` (default) and `ocean`, mixed via the continuous `bgBlend` (0–1) in the store, driven live by the `ModeDial` amp-style knob — mid values are valid resting states, not just transition frames. The halftone set is the same footage through an AE Card Dance rig whose dot grid spans exactly one tile, so seams still meet flush. The halftone layer stacks ABOVE the ocean layer and is the only one whose opacity changes with the blend (no dark dip mid-mix, and no CSS transition — easing would lag the knob); a set dragged back into view is seeked to the visible set's currentTime so the mix shows one moment of the same world; a set resting at zero contribution pauses to save decode.

## Placeholder Image Pattern

All screens use the reusable `<PlaceholderImage />` (`src/components/PlaceholderImage/`) for images until real assets are provided. Variants: `photo`, `screenshot` (fake browser chrome), `polaroid` (white matte + handwritten caption). To swap in a real asset, add `src` to the corresponding entry in `src/data/*.ts` — the component renders an `<img>` in the same box.

## Life & Photos Direction

The Life & Photos screen has a scrapbook/collage aesthetic — scattered/rotated polaroids, tape/pin decorations, handwritten labels (Caveat). Not a clean grid; organic and layered like a physical pinboard. Photo positions live in `src/data/lifePhotos.ts`; keep them out of the NavHint safe zones documented there.
