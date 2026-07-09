import { useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { AnimationPlaybackControls } from 'framer-motion'
import { useNavStore } from '../../store/useNavStore'
import styles from './ModeDial.module.css'

// Amp-style knob in the top-right corner that mixes the halftone set over the
// full-color ocean set. Fully left = ocean, fully right = halftone, and every
// position in between is a live crossfade — the knob IS the fade. Grab it and
// rotate (angular drag around the pivot), scroll over it, tap arrow keys, or
// plain-click to flip to the other side like the old toggle.

const MIN_DEG = -135
const MAX_DEG = 135
const SWEEP = MAX_DEG - MIN_DEG

// Released inside this distance of an end, the knob settles into it like a
// detent — landing exactly on 0/1 lets OceanBackground park the hidden set.
const DETENT_DEG = 20

const TICK_COUNT = 25

const degToBlend = (deg: number) => (deg - MIN_DEG) / SWEEP
const blendToDeg = (blend: number) => MIN_DEG + blend * SWEEP
const clampDeg = (deg: number) => Math.min(MAX_DEG, Math.max(MIN_DEG, deg))

// Local shape instead of framer's ValueAnimationTransition, which this build
// doesn't re-export.
type SettleTransition =
  | { type: 'spring'; stiffness: number; damping: number }
  | { duration: number; ease: 'easeInOut' | 'easeOut' }

const detentSpring: SettleTransition = { type: 'spring', stiffness: 420, damping: 30 }

export default function ModeDial() {
  const bgBlend = useNavStore((s) => s.bgBlend)
  const loadingComplete = useNavStore((s) => s.loadingComplete)
  const setBgBlend = useNavStore((s) => s.setBgBlend)

  // The knob's rotation is the single interaction source; every input path
  // (drag, wheel, keys, click-flip) moves this value and the store follows.
  const rotation = useMotionValue(blendToDeg(useNavStore.getState().bgBlend))
  useEffect(
    () => rotation.on('change', (deg) => setBgBlend(degToBlend(deg))),
    [rotation, setBgBlend],
  )

  const dialRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const dragRef = useRef<{
    pointerId: number
    lastAngle: number | null
    downX: number
    downY: number
    movedPx: number
  } | null>(null)

  const settleTo = (deg: number, transition: SettleTransition) => {
    animRef.current?.stop()
    animRef.current = animate(rotation, deg, transition)
  }

  // Pointer angle around the knob pivot: 0° = up, clockwise positive.
  // Unreadable too close to the pivot, so bail and re-anchor once outside.
  const pointerDeg = (e: React.PointerEvent) => {
    const rect = dialRef.current!.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    if (Math.hypot(dx, dy) < 10) return null
    return Math.atan2(dx, -dy) * (180 / Math.PI)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    animRef.current?.stop()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      pointerId: e.pointerId,
      lastAngle: pointerDeg(e),
      downX: e.clientX,
      downY: e.clientY,
      movedPx: 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || e.pointerId !== drag.pointerId) return
    drag.movedPx = Math.max(drag.movedPx, Math.hypot(e.clientX - drag.downX, e.clientY - drag.downY))
    const a = pointerDeg(e)
    if (a === null) {
      drag.lastAngle = null
      return
    }
    if (drag.lastAngle === null) {
      drag.lastAngle = a
      return
    }
    // shortest signed arc, so dragging across the ±180° seam doesn't jump
    let delta = a - drag.lastAngle
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    drag.lastAngle = a
    rotation.set(clampDeg(rotation.get() + delta))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || e.pointerId !== drag.pointerId) return
    dragRef.current = null
    const deg = rotation.get()
    if (drag.movedPx < 4) {
      // a plain click still flips to the other side, like the old toggle
      settleTo(deg >= 0 ? MIN_DEG : MAX_DEG, { duration: 0.8, ease: 'easeInOut' })
    } else if (MAX_DEG - deg <= DETENT_DEG) {
      settleTo(MAX_DEG, detentSpring)
    } else if (deg - MIN_DEG <= DETENT_DEG) {
      settleTo(MIN_DEG, detentSpring)
    }
  }

  // Scrolling over the dial nudges it instead of navigating. React delegates
  // wheel as passive, so attach directly to keep preventDefault working.
  useEffect(() => {
    const el = dialRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      animRef.current?.stop()
      const step = SWEEP * 0.06
      rotation.set(clampDeg(rotation.get() + (e.deltaY < 0 ? step : -step)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [rotation, loadingComplete])

  const onKeyDown = (e: React.KeyboardEvent) => {
    let target: number
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        target = clampDeg(rotation.get() + SWEEP * 0.1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        target = clampDeg(rotation.get() - SWEEP * 0.1)
        break
      case 'Home':
        target = MIN_DEG
        break
      case 'End':
        target = MAX_DEG
        break
      default:
        return
    }
    e.preventDefault()
    e.stopPropagation() // keep World's window-level arrow navigation out of it
    settleTo(target, { duration: 0.2, ease: 'easeOut' })
  }

  if (!loadingComplete) return null

  const pct = Math.round(bgBlend * 100)

  return (
    <div
      className={styles.wrap}
      role="slider"
      tabIndex={0}
      aria-label="Background mix"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct}% halftone`}
      onKeyDown={onKeyDown}
    >
      <div
        ref={dialRef}
        className={styles.dial}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg className={styles.ticks} viewBox="0 0 96 96" aria-hidden="true">
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const frac = i / (TICK_COUNT - 1)
            return (
              <line
                key={i}
                x1="48"
                y1="3.5"
                x2="48"
                y2="9.5"
                transform={`rotate(${MIN_DEG + frac * SWEEP} 48 48)`}
                className={frac <= bgBlend + 1e-3 ? styles.tickLit : styles.tick}
              />
            )
          })}
        </svg>
        <div className={styles.knob}>
          <motion.div className={styles.rotor} style={{ rotate: rotation }}>
            <div className={styles.cap} />
            <div className={styles.pointer} />
          </motion.div>
          <div className={styles.sheen} />
        </div>
        {/* wave lines — the full-color ocean end */}
        <svg
          className={styles.iconSea}
          style={{ opacity: 0.3 + 0.65 * (1 - bgBlend) }}
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 9c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
          <path d="M2 15c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
        </svg>
        {/* fading dot grid — the halftone end */}
        <svg
          className={styles.iconInk}
          style={{ opacity: 0.3 + 0.65 * bgBlend }}
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="5" r="2.6" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="5" r="1.4" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="19" r="1.4" />
          <circle cx="12" cy="19" r="1" />
          <circle cx="19" cy="19" r="0.7" />
        </svg>
        <span className={styles.label}>MODE</span>
      </div>
    </div>
  )
}
