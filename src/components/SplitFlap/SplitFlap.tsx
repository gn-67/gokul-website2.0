import { useState, useEffect, useRef } from 'react'
import styles from './SplitFlap.module.css'

const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
// Must stay a hair longer than the fast leaf animation (see .fast in the
// module css) so each scramble flip completes before the next char arrives.
const TICK_INTERVAL = 80

function randomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

interface FlapTileProps {
  char: string
  locked: boolean
  sizeClass: string
  fast: boolean
  hideDivider: boolean
}

/**
 * One Solari tile. The static top half always previews the incoming char and
 * the static bottom half keeps the outgoing one; a 3D leaf (front = old char,
 * back = new char) flips down around the divider between them. Keying the
 * leaf by the transition restarts the animation if the char changes mid-flip.
 */
function FlapTile({ char, locked, sizeClass, fast, hideDivider }: FlapTileProps) {
  const [shown, setShown] = useState(char)
  const flipping = char !== shown
  const charClass = `${styles.flapChar} ${locked ? styles.locked : ''}`

  return (
    <span className={`${styles.flapWrapper} ${sizeClass} ${fast ? styles.fast : ''}`}>
      <span className={styles.flapTop}>
        <span className={charClass}>{char}</span>
      </span>
      <span className={styles.flapBottom}>
        <span className={charClass}>{shown}</span>
      </span>
      {flipping && (
        <span
          key={`${shown}->${char}`}
          className={styles.leaf}
          onAnimationEnd={() => setShown(char)}
        >
          <span className={`${styles.leafFace} ${styles.leafFront}`}>
            <span className={charClass}>{shown}</span>
          </span>
          <span className={`${styles.leafFace} ${styles.leafBack}`}>
            <span className={charClass}>{char}</span>
          </span>
        </span>
      )}
      {!hideDivider && <span className={styles.flapDivider} />}
    </span>
  )
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
  const [introComplete, setIntroComplete] = useState(false)
  const tickRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasAnimated = useRef(false)
  const introCompleteRef = useRef(false)
  const linesRef = useRef(lines)
  useEffect(() => {
    linesRef.current = lines
  }, [lines])

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
        setIntroComplete(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, TICK_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      // If cleanup runs before the animation finished (e.g. React StrictMode
      // double-mount), reset the flag so the next setup can restart it.
      if (!introCompleteRef.current) {
        hasAnimated.current = false
      }
    }
  }, [active, initialCycles, staggerDelay])

  // --- Live mode: after intro is done, render chars directly from props ---
  const renderChars =
    live && introComplete ? lines.map((line) => [...line]) : displayChars

  const isCharLocked = (flatIdx: number) => {
    if (live) return true
    return lockedSet.has(flatIdx)
  }

  const sizeClass = size === 'small' ? styles.small : ''

  return (
    <div className={`${styles.textBlock} ${alignEnd ? styles.alignEnd : ''}`}>
      {renderChars.map((lineChars, lineIdx) => (
        <div key={lineIdx} className={`${styles.line} ${alignEnd ? styles.lineEnd : ''}`}>
          {lineChars.map((char, charIdx) => {
            // Colons (clock separators) render as fixed pulsing dots between
            // tile groups, like the printed colon on a real flip clock.
            if ((lines[lineIdx]?.[charIdx] ?? ' ') === ':') {
              return (
                <span
                  key={charIdx}
                  className={`${styles.sep} ${size === 'small' ? styles.sepSmall : ''}`}
                >
                  <i />
                  <i />
                </span>
              )
            }
            const flatIdx =
              lines.slice(0, lineIdx).reduce((s, l) => s + l.length, 0) + charIdx
            return (
              <FlapTile
                key={charIdx}
                char={char}
                locked={isCharLocked(flatIdx)}
                sizeClass={sizeClass}
                fast={!introComplete}
                hideDivider={hideDivider}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
