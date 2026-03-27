import { useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { getNavHintsForScreen } from '../../store/useNavStore'
import NavHint from '../NavHint/NavHint'
import profileBg from '../../assets/images/profilebg.jpeg'
import profileFg from '../../assets/images/profileFG.png'
import styles from './AboutScreen.module.css'

export default function AboutScreen() {
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

      {getNavHintsForScreen('about').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
