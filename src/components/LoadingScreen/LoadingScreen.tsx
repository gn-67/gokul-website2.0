import { useState, useEffect } from 'react'
import profileBg from '../../assets/images/profilebg.jpeg'
import profileFg from '../../assets/images/profileFG.png'
import oceanHomePoster from '../../assets/ocean/ocean-home.png'
import oceanUpPoster from '../../assets/ocean/ocean-up.png'
import oceanDownPoster from '../../assets/ocean/ocean-down.png'
import oceanLeftPoster from '../../assets/ocean/ocean-left.png'
import oceanRightPoster from '../../assets/ocean/ocean-right.png'
import halftoneHomePoster from '../../assets/ocean/halftone-home.jpg'
import halftoneUpPoster from '../../assets/ocean/halftone-up.jpg'
import halftoneDownPoster from '../../assets/ocean/halftone-down.jpg'
import halftoneLeftPoster from '../../assets/ocean/halftone-left.jpg'
import halftoneRightPoster from '../../assets/ocean/halftone-right.jpg'
import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  onComplete?: () => void
}

const MIN_DISPLAY_MS = 800
const SAFETY_TIMEOUT_MS = 5000
const PRELOAD_IMAGES = [
  profileBg,
  profileFg,
  // background video posters (both sets) — shown the instant the site
  // appears, before the videos themselves finish buffering
  halftoneHomePoster,
  halftoneUpPoster,
  halftoneDownPoster,
  halftoneLeftPoster,
  halftoneRightPoster,
  oceanHomePoster,
  oceanUpPoster,
  oceanDownPoster,
  oceanLeftPoster,
  oceanRightPoster,
]
const PRELOAD_FONTS = ["300 1rem 'Cooper Light BT'", '600 1rem Caveat']

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, MIN_DISPLAY_MS))

    // Explicitly kick off font loads — font-display: swap won't start them
    // until the font is first painted, and fonts.ready can resolve early.
    PRELOAD_FONTS.forEach((f) => document.fonts.load(f))
    const fonts = document.fonts.ready
    const images = Promise.all(PRELOAD_IMAGES.map(preloadImage))

    // Never hang the site on a stuck asset.
    const assets = Promise.race([
      Promise.all([fonts, images]),
      new Promise((r) => setTimeout(r, SAFETY_TIMEOUT_MS)),
    ])

    let cancelled = false
    Promise.all([minDelay, assets]).then(() => {
      if (!cancelled) setFading(true)
    })
    return () => {
      cancelled = true
    }
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
