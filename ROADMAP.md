# Portfolio Website — ROADMAP

## Vision

A 2D free-roam personal portfolio website. The user lands on a central Home screen and can scroll freely in any cardinal direction to reach other sections. The entire "world" is a 3×3 grid with 5 populated screens arranged in a cross/plus shape. Navigation uses native browser 2D scroll with CSS scroll-snap for a smooth, natural feel — like scrolling on a normal page. Keyboard and WASD buttons provide alternative navigation via smooth `scrollTo()`. A beach background (custom MP4) will be added in a later phase, fixed behind the entire world.

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

The world is a 3×3 CSS grid (300vw × 300vh). Only the 5 screens above are populated — the 4 corner cells are empty. CSS `scroll-snap-type: both mandatory` snaps to valid screens only. On load, the viewport scrolls instantly to Home (center cell) before anything renders.

> **Note:** Code-level labels differ from display names. In `useNavStore.ts`: Work → id `dev`, label `WORK`; Experiences → id `design`, label `STUDIO`.

## Tech Stack

| Tool            | Why                                                        |
|-----------------|------------------------------------------------------------|
| Vite            | Fast dev server, simple config, no SSR overhead            |
| React           | Component model, ecosystem, familiarity                    |
| TypeScript      | Type safety with minimal overhead                          |
| Zustand         | Lightweight state — tracks active screen for future use    |
| Framer Motion   | Reserved for content animations in later phases            |
| CSS Modules     | Scoped styles, no runtime cost, co-located with components |
| Native Scroll   | Most natural feel — real browser scroll, not transforms    |
| CSS Scroll-Snap | Snaps to screens without JS; smooth and performant         |

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

### Phase 2: Loading Screen + Asset Preloading ← **WE ARE HERE**
- Simple loading screen component
- Covers the world until scroll-to-home completes
- Fades out to reveal the site

### Phase 3: Beach MP4 Background ⏸ **DEFERRED** (no assets available yet)
- Fixed video background behind the entire world
- Performance considerations (autoplay, loop, muted)

### Phase 4: Home Screen Content
- Name, tagline, nav hints
- Entry animations

### Phase 5: Work Screen
- Project showcases, links, descriptions
- Use `<PlaceholderImage />` components for project thumbnails/screenshots until real assets are provided

### Phase 6: Experiences Screen
- Design portfolio, other creative work
- Use `<PlaceholderImage />` components for portfolio pieces until real assets are provided

### Phase 7: About Me Screen
- Bio, skills, background
- Use `<PlaceholderImage />` components for profile/background images until real assets are provided

### Phase 8: Life & Photos Screen
- Photo gallery with a scrapbook/collage aesthetic — not a clean grid
- Scattered/rotated photos, tape/pin decorations, handwritten-style labels
- Organic, layered layout evoking a physical scrapbook or pinboard
- Use `<PlaceholderImage />` components throughout — easily swappable when real photos arrive

### Phase 9: Polish, Mobile QA, Performance
- Mobile/touch support
- Cross-browser testing
- Performance optimization
- Final polish

## Decisions Log

| Decision | Reasoning | Date |
|----------|-----------|------|
| Native scroll + scroll-snap over transform-based navigation | User wants scrolling to feel like a normal page; native scroll is the most natural approach | 2026-03-21 |
| Skip mobile/touch support until Phase 9 | Project is complex; want desktop vision locked in first | 2026-03-21 |
| No React Router | Navigation is spatial (scroll-based), not URL-based | 2026-03-21 |
| Phase 3 deferred | Blender files/recordings for MP4 not available yet; will revisit when assets are ready | 2026-03-21 |
| Framer Motion AnimatePresence over native scroll | Infinite loop navigation (wrapping + perpendicular targets) requires screens that aren't physically adjacent — native scroll can't support this. AnimatePresence slide transitions give the same scroll-like feel with full control over navigation targets | 2026-03-26 |
| Rename "Dev Works" → "Work", "Design & Other Works" → "Experiences" | Cleaner display names. Code-level ids/labels unchanged (`dev`/`WORK`, `design`/`STUDIO`) | 2026-07-02 |
