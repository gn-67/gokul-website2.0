import { useState, useEffect } from 'react'
import { useNavStore } from '../../store/useNavStore'
import SplitFlap from '../SplitFlap/SplitFlap'
import NavHint from '../NavHint/NavHint'
import styles from './HomeScreen.module.css'

function getMilitaryTime(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function HomeScreen() {
  const loadingComplete = useNavStore((s) => s.loadingComplete)
  const [time, setTime] = useState(getMilitaryTime)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getMilitaryTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.screen}>
      <div className={styles.topLeft} aria-label="Gokul Nambiar">
        <SplitFlap lines={['GOKUL', 'NAMBIAR']} active={loadingComplete} />
      </div>
      <div className={styles.topRight}>
        <SplitFlap lines={[time]} active={loadingComplete} size="small" alignEnd live hideDivider />
      </div>

      <NavHint direction="up" label="ABOUT ME" />
      <NavHint direction="down" label="LIFE & PHOTOS" />
      <NavHint direction="left" label="DESIGN & OTHER WORKS" />
      <NavHint direction="right" label="DEV WORKS" />
    </div>
  )
}
