// PLACEHOLDER CONTENT — replace each [bracketed] value with real project info.
// To use a real screenshot, add a `src` to the image entry (import the asset
// at the top of this file); the layout swaps it in automatically.

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  stack: string[]
  year: string
  link?: string
  image: {
    label: string
    src?: string
    aspectRatio?: string
  }
}

export const PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: '[project one]',
    tagline: '[one-line tagline for the project]',
    description:
      '[2–3 sentence description of what it does, why you built it, and what makes it interesting.]',
    stack: ['[tech]', '[tech]', '[tech]'],
    year: '[year]',
    image: { label: '[screenshot: project one]' },
  },
  {
    id: 'project-2',
    title: '[project two]',
    tagline: '[one-line tagline for the project]',
    description:
      '[2–3 sentence description of what it does, why you built it, and what makes it interesting.]',
    stack: ['[tech]', '[tech]'],
    year: '[year]',
    image: { label: '[screenshot: project two]' },
  },
  {
    id: 'project-3',
    title: '[project three]',
    tagline: '[one-line tagline for the project]',
    description:
      '[2–3 sentence description of what it does, why you built it, and what makes it interesting.]',
    stack: ['[tech]', '[tech]', '[tech]'],
    year: '[year]',
    image: { label: '[screenshot: project three]' },
  },
  {
    id: 'project-4',
    title: '[project four]',
    tagline: '[one-line tagline for the project]',
    description:
      '[2–3 sentence description of what it does, why you built it, and what makes it interesting.]',
    stack: ['[tech]', '[tech]'],
    year: '[year]',
    image: { label: '[screenshot: project four]' },
  },
]
