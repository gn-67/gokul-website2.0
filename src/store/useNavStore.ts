import { create } from 'zustand'

export interface GridPosition {
  x: number
  y: number
}

export interface Screen {
  id: string
  label: string
  position: GridPosition
  color: string
}

export const SCREENS: Screen[] = [
  { id: 'about', label: 'ABOUT ME', position: { x: 0, y: -1 }, color: '#2D6A4F' },
  { id: 'design', label: 'DESIGN & OTHER WORKS', position: { x: -1, y: 0 }, color: '#7B2D8B' },
  { id: 'home', label: 'HOME', position: { x: 0, y: 0 }, color: '#1A1A2E' },
  { id: 'dev', label: 'DEV WORKS', position: { x: 1, y: 0 }, color: '#B44215' },
  { id: 'life', label: 'LIFE & PHOTOS', position: { x: 0, y: 1 }, color: '#1B4965' },
]

// Grid spans from -1 to 1 on both axes → 3 columns, 3 rows
// We offset by 1 so pixel positions are non-negative
export const GRID_OFFSET = 1

interface NavState {
  activeScreen: GridPosition
  setActiveScreen: (pos: GridPosition) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeScreen: { x: 0, y: 0 },
  setActiveScreen: (pos) => set({ activeScreen: pos }),
}))

export function getScreenAt(x: number, y: number): Screen | undefined {
  return SCREENS.find((s) => s.position.x === x && s.position.y === y)
}

export function isValidPosition(x: number, y: number): boolean {
  return getScreenAt(x, y) !== undefined
}
