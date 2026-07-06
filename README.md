# gokul-website2.0

A 2D free-roam personal portfolio. You land on a central **Home** screen and
navigate in cardinal directions through an infinite, wrapping world of five
screens:

```
            About Me (up)

Experiences    HOME       Work
  (left)                 (right)

          Life & Photos (down)
```

## Controls

- **Scroll** (mouse wheel / trackpad) in any direction
- **WASD** or **arrow keys**
- **Click** the edge navigation hints

Navigation wraps — keep going in one direction and you loop around.

## Stack

- React 19 + TypeScript, built with Vite
- Zustand for navigation state (`src/store/useNavStore.ts`)
- Framer Motion for slide transitions and screen animations
- CSS Modules, with shared design tokens in `src/index.css`
- Self-hosted fonts: Cooper Light BT (serif) and Caveat (handwritten, via
  `@fontsource/caveat`)

## Commands

| Command           | Does                                        |
|-------------------|---------------------------------------------|
| `npm run dev`     | start the dev server                        |
| `npm run build`   | typecheck + production build                |
| `npm run lint`    | run ESLint                                  |
| `npm run preview` | preview the production build                |

## Swapping in real content

All placeholder content is data-driven and marked with `[brackets]`:

- **Projects** — edit `src/data/projects.ts`
- **Experiences / creative shelf** — edit `src/data/experiences.ts`
- **Life photos + captions** — edit `src/data/lifePhotos.ts`

To replace a placeholder frame with a real image, import the asset in the
data file and add it as `src` on the entry — the `<PlaceholderImage />`
component (`src/components/PlaceholderImage/`) swaps to a real `<img>`
automatically, keeping the same layout.

## Structure

```
src/
  store/useNavStore.ts        navigation map + active screen state
  hooks/useScrambleText.ts    scramble-reveal text animation
  data/                       editable placeholder content
  components/
    World/                    slide-transition navigation engine
    Screen/                   generic fallback screen
    HomeScreen/               split-flap name + live clock
    AboutScreen/              parallax profile card + bio
    WorkScreen/               project showcase (master-detail)
    StudioScreen/             experience timeline + creative shelf
    LifeScreen/               scrapbook photo collage
    NavHint/                  edge navigation hints
    SplitFlap/                split-flap display component
    LoadingScreen/            asset preloading + fade-in
    PlaceholderImage/         swappable image placeholder
```
