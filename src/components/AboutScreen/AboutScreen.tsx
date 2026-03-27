import { useCallback, useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { getNavHintsForScreen } from '../../store/useNavStore'
import NavHint from '../NavHint/NavHint'
import profileBg from '../../assets/images/profilebg.jpeg'
import profileFg from '../../assets/images/profileFG.png'
import styles from './AboutScreen.module.css'

const GREETINGS = ['hello!', 'ഹലോ!']
const CYCLE_INTERVAL = 5000
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%!?+=$'
const TICK_INTERVAL = 40
const SCRAMBLE_CYCLES = 3
const STAGGER_TICKS = 50 / TICK_INTERVAL

function randomChar() {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]
}

function useScrambleText(text: string) {
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

export default function AboutScreen() {
  const [greetIdx, setGreetIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setGreetIdx((i) => (i + 1) % GREETINGS.length)
    }, CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [])

  const greetChars = useScrambleText(GREETINGS[greetIdx])
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const bgX = useSpring(useTransform(mouseX, [-1, 1], [20, -20]), { stiffness: 120, damping: 20 })
  const bgY = useSpring(useTransform(mouseY, [-1, 1], [20, -20]), { stiffness: 120, damping: 20 })
  const fgX = useSpring(useTransform(mouseX, [-1, 1], [3, -3]), { stiffness: 120, damping: 20 })
  const fgY = useSpring(useTransform(mouseY, [-1, 1], [3, -3]), { stiffness: 120, damping: 20 })
  const glareX = useSpring(useTransform(mouseX, [-1, 1], [-30, 30]), { stiffness: 100, damping: 25 })
  const glareY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), { stiffness: 100, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1)
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1)
    },
    [mouseX, mouseY],
  )

  return (
    <div className={styles.screen} onMouseMove={handleMouseMove}>
      <div className={styles.card}>
        <motion.img
          src={profileBg}
          alt=""
          className={styles.bgLayer}
          style={{ x: bgX, y: bgY }}
        />
        <motion.img
          src={profileFg}
          alt=""
          className={styles.fgLayer}
          style={{ x: fgX, y: fgY }}
        />
        <motion.div
          className={styles.glareLayer}
          style={{ x: glareX, y: glareY }}
        />
      </div>

      <div className={styles.rightContent}>
        <span className={styles.greeting}>
          {greetChars.map((ch, i) => (
            <span key={i} className={styles.greetChar}>{ch}</span>
          ))}
        </span>
        <div className={styles.glassPanel}>
          <p className={styles.blurb}>
            I'm Gokul, a human who loves developing for the benefit of other humans. I get unreasonably excited about the places where human cognition and technology start to blur. What I care about the most is that my work is genuinely impactful, even if only for one person :)
          </p>
        </div>
      </div>

      {getNavHintsForScreen('about').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
