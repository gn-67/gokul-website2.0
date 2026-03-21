import { useState, useEffect } from 'react'
import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  onComplete?: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Short delay to ensure scroll-to-home has completed, then fade out
    const timer = setTimeout(() => {
      setFading(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleTransitionEnd = () => {
    if (fading) {
      setVisible(false)
      onComplete?.()
    }
  }

  if (!visible) return null

  return (
    <div
      className={`${styles.overlay} ${fading ? styles.fadeOut : ''}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <p className={styles.text}>Loading</p>
    </div>
  )
}
