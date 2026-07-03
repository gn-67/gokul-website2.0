// PLACEHOLDER CONTENT — replace each [bracketed] value with real photo info,
// and add a `src` (imported asset) to swap a placeholder for the real photo.
//
// Positions are % of the screen. Keep photos out of the NavHint safe zones:
//   - top-center and bottom-center strips (x 38–62%, y < 12% or y > 84%)
//   - left/right mid-edge zones (y 40–60%, x < 10% or x > 86%)

export interface ScrapPhoto {
  id: string
  label: string
  caption: string
  src?: string
  x: string
  y: string
  rotate: number
  width: string
  decoration: 'tape' | 'pin' | 'none'
  z?: number
  aspectRatio?: string
}

export const LIFE_PHOTOS: ScrapPhoto[] = [
  {
    id: 'photo-1',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '6%',
    y: '10%',
    rotate: -6,
    width: 'clamp(150px, 16vw, 240px)',
    decoration: 'tape',
    z: 3,
  },
  {
    id: 'photo-2',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '24%',
    y: '38%',
    rotate: 4,
    width: 'clamp(140px, 14vw, 210px)',
    decoration: 'pin',
    z: 2,
    aspectRatio: '3 / 4',
  },
  {
    id: 'photo-3',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '42%',
    y: '16%',
    rotate: 2.5,
    width: 'clamp(150px, 16vw, 240px)',
    decoration: 'pin',
    z: 1,
  },
  {
    id: 'photo-4',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '63%',
    y: '8%',
    rotate: -3,
    width: 'clamp(140px, 15vw, 220px)',
    decoration: 'tape',
    z: 2,
    aspectRatio: '3 / 4',
  },
  {
    id: 'photo-5',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '70%',
    y: '52%',
    rotate: 5,
    width: 'clamp(150px, 16vw, 240px)',
    decoration: 'tape',
    z: 3,
  },
  {
    id: 'photo-6',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '48%',
    y: '55%',
    rotate: -4.5,
    width: 'clamp(140px, 14vw, 210px)',
    decoration: 'pin',
    z: 2,
  },
  {
    id: 'photo-7',
    label: '[photo]',
    caption: '[caption — where / when]',
    x: '12%',
    y: '62%',
    rotate: 7,
    width: 'clamp(130px, 13vw, 200px)',
    decoration: 'none',
    z: 1,
    aspectRatio: '1 / 1',
  },
]
