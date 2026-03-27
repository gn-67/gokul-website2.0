import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavStore } from '../../store/useNavStore'
import styles from './NavHint.module.css'

const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
const TICK_INTERVAL = 40
const INITIAL_CYCLES = 3
const STAGGER_TICKS = 50 / TICK_INTERVAL // ~1.25 ticks per char

function randomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

const ARROWS: Record<string, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
}

interface NavHintProps {
  direction: 'up' | 'down' | 'left' | 'right'
  label: string
}

export default function NavHint({ direction, label }: NavHintProps) {
  const navigateTo = useNavStore((s) => s.navigateTo)
  const [isHovered, setIsHovered] = useState(false)
  const [displayChars, setDisplayChars] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef(0)

  const clearAnim = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isHovered) {
      clearAnim()
      setDisplayChars([])
      return
    }

    tickRef.current = 0
    const chars = label.split('')

    intervalRef.current = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current

      const next = chars.map((target, i) => {
        const lockAt = INITIAL_CYCLES + i * STAGGER_TICKS
        if (target === ' ') return ' '
        return tick >= lockAt ? target : randomChar()
      })

      setDisplayChars(next)

      const lastLock = INITIAL_CYCLES + (chars.length - 1) * STAGGER_TICKS
      if (tick >= lastLock) {
        clearAnim()
      }
    }, TICK_INTERVAL)

    return clearAnim
  }, [isHovered, label, clearAnim])

  const arrow = ARROWS[direction]
  const isVertical = direction === 'left' || direction === 'right'

  const labelEl = displayChars.length > 0 && (
    <span className={styles.label}>
      {displayChars.map((ch, i) => (
        <span key={i} className={styles.char}>
          {ch}
        </span>
      ))}
    </span>
  )

  return (
    <div
      className={`${styles.hint} ${styles[direction]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigateTo(direction)}
      style={{ cursor: 'pointer' }}
    >
      {isVertical ? (
        direction === 'left' ? (
          <>
            <span className={styles.arrow}>{arrow}</span>
            {labelEl}
          </>
        ) : (
          <>
            {labelEl}
            <span className={styles.arrow}>{arrow}</span>
          </>
        )
      ) : direction === 'up' ? (
        <>
          <span className={styles.arrow}>{arrow}</span>
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          <span className={styles.arrow}>{arrow}</span>
        </>
      )}
    </div>
  )
}
