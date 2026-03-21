import { useRef, useEffect, useCallback } from 'react'
import Screen from '../Screen/Screen'
import HomeScreen from '../HomeScreen/HomeScreen'
import { SCREENS, GRID_OFFSET, useNavStore, getScreenAt } from '../../store/useNavStore'
import styles from './World.module.css'

// Grid is 3×3 (indices 0-2 on each axis)
const GRID_SIZE = 3

export default function World() {
  const containerRef = useRef<HTMLDivElement>(null)
  const setActiveScreen = useNavStore((s) => s.setActiveScreen)

  // Scroll to Home (center cell) instantly on mount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({
      left: GRID_OFFSET * window.innerWidth,
      top: GRID_OFFSET * window.innerHeight,
      behavior: 'instant',
    })
  }, [])

  // Track active screen from scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const col = Math.round(el.scrollLeft / window.innerWidth)
        const row = Math.round(el.scrollTop / window.innerHeight)
        setActiveScreen({ x: col - GRID_OFFSET, y: row - GRID_OFFSET })
        ticking = false
      })
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [setActiveScreen])

  // Keyboard / WASD navigation
  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    const el = containerRef.current
    if (!el) return

    let dx = 0
    let dy = 0
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        dy = -1
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        dy = 1
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        dx = -1
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        dx = 1
        break
      default:
        return
    }

    e.preventDefault()

    const currentCol = Math.round(el.scrollLeft / window.innerWidth)
    const currentRow = Math.round(el.scrollTop / window.innerHeight)
    const targetX = currentCol - GRID_OFFSET + dx
    const targetY = currentRow - GRID_OFFSET + dy

    if (!getScreenAt(targetX, targetY)) return

    el.scrollTo({
      left: (targetX + GRID_OFFSET) * window.innerWidth,
      top: (targetY + GRID_OFFSET) * window.innerHeight,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav)
    return () => window.removeEventListener('keydown', handleKeyNav)
  }, [handleKeyNav])

  // Build the 3×3 grid cells
  const cells = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const gridX = col - GRID_OFFSET
      const gridY = row - GRID_OFFSET
      const screen = SCREENS.find(
        (s) => s.position.x === gridX && s.position.y === gridY
      )

      cells.push(
        <div key={`${col}-${row}`} className={screen ? styles.snapCell : styles.emptyCell}>
          {screen && (
            screen.id === 'home'
              ? <HomeScreen />
              : <Screen label={screen.label} color={screen.color} />
          )}
        </div>
      )
    }
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.grid}>
        {cells}
      </div>
    </div>
  )
}
