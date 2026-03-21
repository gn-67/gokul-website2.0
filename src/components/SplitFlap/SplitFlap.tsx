import { useState, useEffect, useRef } from 'react'
import styles from './SplitFlap.module.css'

const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
const TICK_INTERVAL = 40

function randomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

interface SplitFlapProps {
  lines: string[]
  active: boolean
  initialCycles?: number
  staggerDelay?: number
  size?: 'normal' | 'small'
  alignEnd?: boolean
  /** If true, chars update directly after intro (no scramble), used for live-updating text like a clock */
  live?: boolean
  /** If true, hide the horizontal divider line on flap tiles */
  hideDivider?: boolean
}

export default function SplitFlap({
  lines,
  active,
  initialCycles = 8,
  staggerDelay = 100,
  size = 'normal',
  alignEnd = false,
  live = false,
  hideDivider = false,
}: SplitFlapProps) {
  const [displayChars, setDisplayChars] = useState<string[][]>(() =>
    lines.map((line) => Array(line.length).fill(' '))
  )
  const [lockedSet, setLockedSet] = useState<Set<number>>(new Set())
  const tickRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasAnimated = useRef(false)
  const introCompleteRef = useRef(false)
  const linesRef = useRef(lines)
  linesRef.current = lines

  // --- Intro animation (plays once for both live and non-live) ---
  useEffect(() => {
    if (!active || hasAnimated.current) return
    hasAnimated.current = true
    tickRef.current = 0

    const staggerTicks = staggerDelay / TICK_INTERVAL

    intervalRef.current = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current
      const curLines = linesRef.current
      const tc = curLines.reduce((s, l) => s + l.length, 0)
      const newDisplay = curLines.map((line) => [...line].map(() => randomChar()))
      const newLocked = new Set<number>()

      let flatIdx = 0
      for (let l = 0; l < curLines.length; l++) {
        for (let c = 0; c < curLines[l].length; c++) {
          const lockAt = initialCycles + flatIdx * staggerTicks
          if (tick >= lockAt) {
            newDisplay[l][c] = curLines[l][c]
            newLocked.add(flatIdx)
          }
          flatIdx++
        }
      }

      setDisplayChars(newDisplay)
      setLockedSet(newLocked)

      const lastLock = initialCycles + (tc - 1) * staggerTicks
      if (tick >= lastLock) {
        introCompleteRef.current = true
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, TICK_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, initialCycles, staggerDelay])

  // --- Live mode: after intro is done, update chars directly ---
  useEffect(() => {
    if (!live || !introCompleteRef.current) return
    setDisplayChars(lines.map((line) => [...line]))
  }, [lines, live])

  const isCharLocked = (flatIdx: number) => {
    if (live) return true
    return lockedSet.has(flatIdx)
  }

  const sizeClass = size === 'small' ? styles.small : ''

  return (
    <div className={`${styles.textBlock} ${alignEnd ? styles.alignEnd : ''}`}>
      {displayChars.map((lineChars, lineIdx) => (
        <div key={lineIdx} className={`${styles.line} ${alignEnd ? styles.lineEnd : ''}`}>
          {lineChars.map((char, charIdx) => {
            const flatIdx =
              lines.slice(0, lineIdx).reduce((s, l) => s + l.length, 0) + charIdx
            const locked = isCharLocked(flatIdx)
            return (
              <span key={charIdx} className={`${styles.flapWrapper} ${sizeClass}`}>
                <span className={styles.flapTop}>
                  <span className={`${styles.flapChar} ${locked ? styles.locked : ''}`}>
                    {char}
                  </span>
                </span>
                {!hideDivider && <span className={styles.flapDivider} />}
                <span className={styles.flapBottom}>
                  <span className={`${styles.flapChar} ${locked ? styles.locked : ''}`}>
                    {char}
                  </span>
                </span>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
