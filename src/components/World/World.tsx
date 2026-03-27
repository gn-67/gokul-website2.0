import { useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Screen from '../Screen/Screen'
import HomeScreen from '../HomeScreen/HomeScreen'
import AboutScreen from '../AboutScreen/AboutScreen'
import { SCREENS, useNavStore } from '../../store/useNavStore'
import type { Direction } from '../../store/useNavStore'
import styles from './World.module.css'

const DIRECTION_OFFSETS: Record<Direction, { x: string; y: string }> = {
  up:    { x: '0%',    y: '-100%' },
  down:  { x: '0%',    y: '100%' },
  left:  { x: '-100%', y: '0%' },
  right: { x: '100%',  y: '0%' },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const slideVariants = {
  enter: (dir: Direction | null) => {
    if (!dir) return {}
    const offset = DIRECTION_OFFSETS[dir]
    return { x: offset.x, y: offset.y }
  },
  center: { x: '0%', y: '0%' },
  exit: (dir: Direction | null) => {
    if (!dir) return {}
    const opposite = OPPOSITE[dir]
    const offset = DIRECTION_OFFSETS[opposite]
    return { x: offset.x, y: offset.y }
  },
}

const slideTransition = {
  duration: 0.6,
  ease: [0.33, 1, 0.68, 1],
}

export default function World() {
  const activeScreenId = useNavStore((s) => s.activeScreenId)
  const animDirection = useNavStore((s) => s.animDirection)
  const navigateTo = useNavStore((s) => s.navigateTo)
  const setAnimationComplete = useNavStore((s) => s.setAnimationComplete)

  const wheelCooldown = useRef(false)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (wheelCooldown.current) return

    const absX = Math.abs(e.deltaX)
    const absY = Math.abs(e.deltaY)
    const threshold = 30

    let direction: Direction | null = null
    if (absY >= absX && absY > threshold) {
      direction = e.deltaY > 0 ? 'down' : 'up'
    } else if (absX > absY && absX > threshold) {
      direction = e.deltaX > 0 ? 'right' : 'left'
    }

    if (!direction) return
    navigateTo(direction)
    wheelCooldown.current = true
    setTimeout(() => { wheelCooldown.current = false }, 800)
  }, [navigateTo])

  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    let direction: Direction | null = null
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': direction = 'up';    break
      case 'ArrowDown':  case 's': case 'S': direction = 'down';  break
      case 'ArrowLeft':  case 'a': case 'A': direction = 'left';  break
      case 'ArrowRight': case 'd': case 'D': direction = 'right'; break
      default: return
    }
    e.preventDefault()
    navigateTo(direction)
  }, [navigateTo])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav)
    return () => window.removeEventListener('keydown', handleKeyNav)
  }, [handleKeyNav])

  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const screen = SCREENS.find((s) => s.id === activeScreenId)!

  return (
    <div ref={containerRef} className={styles.container}>
      <AnimatePresence initial={false} custom={animDirection}>
        <motion.div
          key={activeScreenId}
          className={styles.screenWrapper}
          custom={animDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          onAnimationComplete={() => setAnimationComplete()}
        >
          {activeScreenId === 'home'
            ? <HomeScreen />
            : activeScreenId === 'about'
            ? <AboutScreen />
            : <Screen id={screen.id} label={screen.label} color={screen.color} />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
