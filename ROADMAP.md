# Portfolio Website — ROADMAP

## Vision

A 2D free-roam personal portfolio website. The user lands on a central Home screen and can scroll freely in any cardinal direction to reach other sections. The "world" is 5 screens arranged in a cross/plus shape with infinite wrap navigation. Navigation uses Framer Motion AnimatePresence slide transitions driven by wheel, WASD/arrow keys, and clickable edge hints (see 2026-03-26 decision — native scroll couldn't support wrapping). A beach background (custom MP4) will be added in a later phase, fixed behind the entire world.

## Grid Map

```
              (0, -1)
              About Me

(-1, 0)       (0, 0)        (1, 0)
Experiences   HOME          Work
              (start)

              (0, 1)
              Life & Photos
```

Only one screen renders at a time; slides animate in from the direction of travel via AnimatePresence. Every screen defines all four directions in `NAVIGATION_MAP` (`src/store/useNavStore.ts`), so navigation wraps infinitely (e.g. up from About loops to Life & Photos).

> **Note:** Code-level labels differ from display names. In `useNavStore.ts`: Work → id `dev`, label `WORK`; Experiences → id `design`, label `STUDIO`.

## Tech Stack

| Tool            | Why                                                        |
|-----------------|------------------------------------------------------------|
| Vite            | Fast dev server, simple config, no SSR overhead            |
| React           | Component model, ecosystem, familiarity                    |
| TypeScript      | Type safety with minimal overhead                          |
| Zustand         | Lightweight state — navigation map + active screen         |
| Framer Motion   | Slide transitions between screens + content animations     |
| CSS Modules     | Scoped styles, no runtime cost, co-located with components |

**Not using:**
- Next.js — no SSR needed
- React Router — navigation is scroll-based, not URL-based

## Phase Breakdown

### Phase 1: Navigation Shell ✅

- 3×3 grid world with native 2D scroll + scroll-snap
- 5 placeholder screens (solid colors, centered labels)
- Keyboard/WASD navigation via `scrollTo()`
- Zustand store tracking active screen position
- Instant scroll to Home on load (no flash)
- No mobile-specific work yet

### Phase 2: Loading Screen + Asset Preloading ✅
- Loading screen with real asset preloading (fonts via `document.fonts.load` + About images)
- 800ms minimum display, 5s safety timeout so a stuck asset never hangs the site
- Fades out to reveal the site; gates the Home split-flap intro

### Phase 3: Ocean Video Background ✅
- Five seamless looping MP4s (20s, 1080p24, ~15MB total) rendered from `ocean.blend` as ONE 5760×3240 frame per frame and sliced, so adjacent screens share exact pixels at every seam (`src/assets/ocean/`, pipeline in `scripts/ocean-render/`)
- `OceanBackground` fixed layer: all five videos permanently mounted, playing muted/looped in sync (clock resync at nav time), sliding in lockstep with screen transitions — the site reads as one continuous camera pan
- Screens are now transparent; a single uniform scrim keeps text legible without painting seam edges; posters preloaded by the LoadingScreen; reduced-motion users get still posters
- Second background set: B&W halftone treatment of the same five tiles (AE Card Dance rig, dot grid spans exactly one tile so seams stay flush), default on load; corner `ModeToggle` crossfades between sets with both videos synced to the same timestamp

### Phase 4: Home Screen Content ✅
- Split-flap name display, live military-time clock, nav hints

### Phase 5: Work Screen ✅
- Master–detail project showcase: 2×2 grid of screenshot-style cards, scramble-reveal title, glass description panel, stack chips
- Content in `src/data/projects.ts` as `[bracketed]` placeholders

### Phase 6: Experiences Screen ✅
- Experience timeline (glowing line-draw, hover re-scramble titles) + creative shelf of rotated placeholder frames
- Content in `src/data/experiences.ts` as `[bracketed]` placeholders

### Phase 7: About Me Screen ✅
- Parallax profile card (real photos), scramble greeting, glass bio panel

### Phase 8: Life & Photos Screen ✅
- Scrapbook pinboard: scattered/rotated polaroids with tape/pin decorations, handwritten Caveat captions, spring drop-in, hover lift
- Content in `src/data/lifePhotos.ts` as `[bracketed]` placeholders

### Phase 9: Polish, Mobile QA, Performance — **partially done**
- ✅ Design tokens, single global @font-face, lint-clean, real preloading, docs
- ⏸ Mobile/touch support deferred (desktop experience locked in first)
- ⏸ Cross-browser QA pass pending

### Remaining work
- Swap `[bracketed]` placeholder copy/images in `src/data/*.ts` for real content
- Mobile/touch navigation + responsive layouts (Phase 9)

## Decisions Log

| Decision | Reasoning | Date |
|----------|-----------|------|
| Native scroll + scroll-snap over transform-based navigation | User wants scrolling to feel like a normal page; native scroll is the most natural approach | 2026-03-21 |
| Skip mobile/touch support until Phase 9 | Project is complex; want desktop vision locked in first | 2026-03-21 |
| No React Router | Navigation is spatial (scroll-based), not URL-based | 2026-03-21 |
| Phase 3 deferred | Blender files/recordings for MP4 not available yet; will revisit when assets are ready | 2026-03-21 |
| Framer Motion AnimatePresence over native scroll | Infinite loop navigation (wrapping + perpendicular targets) requires screens that aren't physically adjacent — native scroll can't support this. AnimatePresence slide transitions give the same scroll-like feel with full control over navigation targets | 2026-03-26 |
| Rename "Dev Works" → "Work", "Design & Other Works" → "Experiences" | Cleaner display names. Code-level ids/labels unchanged (`dev`/`WORK`, `design`/`STUDIO`) | 2026-07-02 |
| Screens registered via `SCREEN_COMPONENTS` map in World.tsx | Replaces the hardcoded ternary; unmapped ids fall back to the generic `<Screen>` so screens can land incrementally | 2026-07-02 |
| Marked `[bracketed]` placeholder copy in `src/data/*.ts` | All content is data-driven and obviously fake — swapping in real projects/experiences/photos is a data-file edit, no layout changes | 2026-07-02 |
| Ocean background: one giant render sliced into five tiles | Separate per-screen renders can never seam perfectly (compositor glare + raytraced reflections are screen-space); slicing one 5760×3240 render makes every seam exact by construction | 2026-07-04 |
| Background videos in a fixed always-playing layer, screens transparent | Videos must never remount (resets loop clock) or carry per-screen tints (paints seam edges); one shared scrim + lockstep slide animation keeps the one-world illusion | 2026-07-04 |
| Halftone background set (default) + ModeToggle crossfade | Same five tiles through an AE Card Dance halftone rig (dot grid spans one tile — seams verified flush); halftone layer stacks above ocean and only its opacity animates, incoming set seeked to outgoing's clock, hidden set paused after fade | 2026-07-05 |
| Caveat via `@fontsource/caveat` for handwritten text | Self-hosted npm package, no CDN at runtime; `--font-hand` token carries a system-cursive fallback | 2026-07-02 |
| Design tokens in `:root` (index.css) | Colors, fonts, text alphas, glow, glass panel shared across modules; @font-face deduplicated to one global rule | 2026-07-02 |
| Real asset preloading in LoadingScreen | `document.fonts.load` + Image() preloads with 800ms min display and 5s safety race — fixes FOUT on the split-flap intro without risking a hang | 2026-07-02 |
