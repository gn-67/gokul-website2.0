import { useState, useEffect, useRef } from 'react'

const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
const TICK_INTERVAL = 40
const SCRAMBLE_CYCLES = 3
const STAGGER_TICKS = 50 / TICK_INTERVAL

function randomChar() {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

/**
 * Scramble-reveal animation: characters cycle through random glyphs and
 * lock into place left-to-right. Re-runs whenever `text` changes.
 */
export function useScrambleText(text: string) {
  const [display, setDisplay] = useState<string[]>(text.split(''))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef(0)

  useEffect(() => {
    tickRef.current = 0
    const chars = text.split('')

    intervalRef.current = setInterval(() => {
      tickRef.current += 1
      const tick = tickRef.current

      const next = chars.map((target, i) => {
        if (target === ' ') return ' '
        const lockAt = SCRAMBLE_CYCLES + i * STAGGER_TICKS
        return tick >= lockAt ? target : randomChar()
      })

      setDisplay(next)

      const lastLock = SCRAMBLE_CYCLES + (chars.length - 1) * STAGGER_TICKS
      if (tick >= lastLock) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, TICK_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text])

  return display
}
