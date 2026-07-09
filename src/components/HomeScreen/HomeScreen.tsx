import { useState, useEffect } from 'react'
import { useNavStore, getNavHintsForScreen } from '../../store/useNavStore'
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

function getBoardDate(): string {
  return new Date()
    .toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace(',', '')
    .toUpperCase()
}

export default function HomeScreen() {
  const loadingComplete = useNavStore((s) => s.loadingComplete)
  const [time, setTime] = useState(getMilitaryTime)
  const [date, setDate] = useState(getBoardDate)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getMilitaryTime())
      setDate(getBoardDate())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.screen}>
      <div className={styles.topLeft} aria-label="Gokul Nambiar">
        <SplitFlap lines={['gokul', 'nambiar']} active={loadingComplete} />
      </div>
      <div className={styles.topRight}>
        <SplitFlap lines={[time]} active={loadingComplete} size="small" alignEnd live />
        <SplitFlap
          lines={[date]}
          active={loadingComplete}
          size="small"
          alignEnd
          live
          staggerDelay={60}
        />
      </div>

      {getNavHintsForScreen('home').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}

      <span className={styles.controlsHint}>scroll, wasd, or arrow keys to navigate</span>
    </div>
  )
}
