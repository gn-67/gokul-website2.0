import { create } from 'zustand'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Screen {
  id: string
  label: string
  color: string
}

export const SCREENS: Screen[] = [
  { id: 'home', label: 'HOME', color: '#1A1A2E' },
  { id: 'about', label: 'ABOUT', color: '#2D6A4F' },
  { id: 'life', label: 'LIFE', color: '#1B4965' },
  { id: 'dev', label: 'WORK', color: '#B44215' },
  { id: 'design', label: 'STUDIO', color: '#7B2D8B' },
]

interface NavTarget {
  screenId: string
  animDirection: Direction
}

// For every (screen, direction) pair: which screen do we go to, and which direction does the slide animate?
export const NAVIGATION_MAP: Record<string, Record<Direction, NavTarget>> = {
  home: {
    up:    { screenId: 'about',  animDirection: 'up' },
    down:  { screenId: 'life',   animDirection: 'down' },
    left:  { screenId: 'design', animDirection: 'left' },
    right: { screenId: 'dev',    animDirection: 'right' },
  },
  about: {
    down:  { screenId: 'home',   animDirection: 'down' },
    up:    { screenId: 'life',   animDirection: 'up' },    // wrap
    left:  { screenId: 'design', animDirection: 'left' },
    right: { screenId: 'dev',    animDirection: 'right' },
  },
  life: {
    up:    { screenId: 'home',   animDirection: 'up' },
    down:  { screenId: 'about',  animDirection: 'down' },  // wrap
    left:  { screenId: 'design', animDirection: 'left' },
    right: { screenId: 'dev',    animDirection: 'right' },
  },
  dev: {
    left:  { screenId: 'home',   animDirection: 'left' },
    right: { screenId: 'design', animDirection: 'right' }, // wrap
    up:    { screenId: 'about',  animDirection: 'up' },
    down:  { screenId: 'life',   animDirection: 'down' },
  },
  design: {
    right: { screenId: 'home',   animDirection: 'right' },
    left:  { screenId: 'dev',    animDirection: 'left' },  // wrap
    up:    { screenId: 'about',  animDirection: 'up' },
    down:  { screenId: 'life',   animDirection: 'down' },
  },
}

export interface NavHintConfig {
  direction: Direction
  label: string
}

export function getNavHintsForScreen(screenId: string): NavHintConfig[] {
  const map = NAVIGATION_MAP[screenId]
  if (!map) return []
  return (Object.keys(map) as Direction[]).map((dir) => {
    const target = map[dir]
    const screen = SCREENS.find((s) => s.id === target.screenId)!
    return { direction: dir, label: screen.label }
  })
}

interface NavState {
  activeScreenId: string
  animDirection: Direction | null
  isAnimating: boolean
  loadingComplete: boolean
  navigateTo: (direction: Direction) => void
  setAnimationComplete: () => void
  setLoadingComplete: () => void
}

export const useNavStore = create<NavState>((set, get) => ({
  activeScreenId: 'home',
  animDirection: null,
  isAnimating: false,
  loadingComplete: false,

  navigateTo: (direction: Direction) => {
    const { activeScreenId, isAnimating } = get()
    if (isAnimating) return
    const map = NAVIGATION_MAP[activeScreenId]
    if (!map) return
    const target = map[direction]
    if (!target) return
    set({
      activeScreenId: target.screenId,
      animDirection: target.animDirection,
      isAnimating: true,
    })
  },

  setAnimationComplete: () => set({ isAnimating: false }),
  setLoadingComplete: () => set({ loadingComplete: true }),
}))
