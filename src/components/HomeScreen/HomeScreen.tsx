import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavStore } from '../../store/useNavStore'
import styles from './HomeScreen.module.css'

const LINES = ['GOKUL', 'NAMBIAR']
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
const TICK_INTERVAL = 40
const STAGGER_DELAY = 100
const INITIAL_CYCLES = 8

const TOTAL_CHARS = LINES.reduce((sum, line) => sum + line.length, 0)

function randomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

function flatToPosition(flatIndex: number): { lineIdx: number; charIdx: number } {
  let remaining = flatIndex
  for (let i = 0; i < LINES.length; i++) {
    if (remaining < LINES[i].length) return { lineIdx: i, charIdx: remaining }
    remaining -= LINES[i].length
  }
  return { lineIdx: LINES.length - 1, charIdx: LINES[LINES.length - 1].length - 1 }
}

function lockTickForIndex(i: number): number {
  return INITIAL_CYCLES + i * (STAGGER_DELAY / TICK_INTERVAL)
}

function initDisplay(): string[][] {
  return LINES.map((line) => Array(line.length).fill(' '))
}

export default function HomeScreen() {
  const loadingComplete = useNavStore((s) => s.loadingComplete)
  const [displayChars, setDisplayChars] = useState<string[][]>(initDisplay)
  const [lockedSet, setLockedSet] = useState<Set<number>>(new Set())
  const tickRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasAnimated = useRef(false)

  const runTick = useCallback(() => {
    tickRef.current += 1
    const tick = tickRef.current
    const newDisplay = LINES.map((line) => [...line].map(() => randomChar()))
    const newLocked = new Set<number>()

    for (let i = 0; i < TOTAL_CHARS; i++) {
      if (tick >= lockTickForIndex(i)) {
        const { lineIdx, charIdx } = flatToPosition(i)
        newDisplay[lineIdx][charIdx] = LINES[lineIdx][charIdx]
        newLocked.add(i)
      }
    }

    setDisplayChars(newDisplay)
    setLockedSet(newLocked)

    if (tick >= lockTickForIndex(TOTAL_CHARS - 1)) {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (!loadingComplete || hasAnimated.current) return
    hasAnimated.current = true
    tickRef.current = 0
    intervalRef.current = setInterval(runTick, TICK_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadingComplete, runTick])

  return (
    <div className={styles.screen}>
      <div className={styles.textBlock} aria-label="Gokul Nambiar">
        {displayChars.map((lineChars, lineIdx) => (
          <div key={lineIdx} className={styles.line}>
            {lineChars.map((char, charIdx) => {
              const flatIdx =
                LINES.slice(0, lineIdx).reduce((s, l) => s + l.length, 0) + charIdx
              const isLocked = lockedSet.has(flatIdx)
              return (
                <span key={charIdx} className={styles.flapWrapper}>
                  <span className={styles.flapTop}>
                    <span className={`${styles.flapChar} ${isLocked ? styles.locked : ''}`}>
                      {char}
                    </span>
                  </span>
                  <span className={styles.flapDivider} />
                  <span className={styles.flapBottom}>
                    <span className={`${styles.flapChar} ${isLocked ? styles.locked : ''}`}>
                      {char}
                    </span>
                  </span>
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
