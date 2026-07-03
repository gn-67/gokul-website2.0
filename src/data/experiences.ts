// PLACEHOLDER CONTENT — replace each [bracketed] value with real experience info.
// Entries render newest-first, top to bottom on the timeline.

export interface Experience {
  id: string
  period: string
  title: string
  org: string
  blurb: string
  kind: 'education' | 'work' | 'creative'
}

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    period: '[20XX — now]',
    title: '[role or program]',
    org: '[organization]',
    blurb: '[one line about what you did and why it mattered]',
    kind: 'work',
  },
  {
    id: 'exp-2',
    period: '[20XX — 20XX]',
    title: '[role]',
    org: '[organization]',
    blurb: '[one line about what you did and why it mattered]',
    kind: 'work',
  },
  {
    id: 'exp-3',
    period: '[20XX — 20XX]',
    title: '[degree / program]',
    org: '[university]',
    blurb: '[one line about what you studied or focused on]',
    kind: 'education',
  },
  {
    id: 'exp-4',
    period: '[20XX — 20XX]',
    title: '[creative pursuit]',
    org: '[context — freelance, club, personal]',
    blurb: '[one line about the creative work]',
    kind: 'creative',
  },
]

// Creative shelf frames (right side of the screen).
// Add a `src` to swap in a real image.
export interface ShelfPiece {
  id: string
  label: string
  rotate: number
}

export const SHELF_PIECES: ShelfPiece[] = [
  { id: 'shelf-1', label: '[creative work one]', rotate: -4 },
  { id: 'shelf-2', label: '[creative work two]', rotate: 2 },
  { id: 'shelf-3', label: '[creative work three]', rotate: -1.5 },
]
