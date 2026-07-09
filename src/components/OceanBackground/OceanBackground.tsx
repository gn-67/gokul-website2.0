import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavStore } from '../../store/useNavStore'
import type { BgMode, Direction } from '../../store/useNavStore'
import oceanHomeMp4 from '../../assets/ocean/ocean-home.mp4'
import oceanLeftMp4 from '../../assets/ocean/ocean-left.mp4'
import oceanRightMp4 from '../../assets/ocean/ocean-right.mp4'
import oceanUpMp4 from '../../assets/ocean/ocean-up.mp4'
import oceanDownMp4 from '../../assets/ocean/ocean-down.mp4'
import oceanHomePoster from '../../assets/ocean/ocean-home.png'
import oceanLeftPoster from '../../assets/ocean/ocean-left.png'
import oceanRightPoster from '../../assets/ocean/ocean-right.png'
import oceanUpPoster from '../../assets/ocean/ocean-up.png'
import oceanDownPoster from '../../assets/ocean/ocean-down.png'
import halftoneHomeMp4 from '../../assets/ocean/halftone-home.mp4'
import halftoneLeftMp4 from '../../assets/ocean/halftone-left.mp4'
import halftoneRightMp4 from '../../assets/ocean/halftone-right.mp4'
import halftoneUpMp4 from '../../assets/ocean/halftone-up.mp4'
import halftoneDownMp4 from '../../assets/ocean/halftone-down.mp4'
import halftoneHomePoster from '../../assets/ocean/halftone-home.jpg'
import halftoneLeftPoster from '../../assets/ocean/halftone-left.jpg'
import halftoneRightPoster from '../../assets/ocean/halftone-right.jpg'
import halftoneUpPoster from '../../assets/ocean/halftone-up.jpg'
import halftoneDownPoster from '../../assets/ocean/halftone-down.jpg'
import styles from './OceanBackground.module.css'

// All five tiles of each set are crops of one Blender render (the halftone
// set is the same render passed through an AE Card Dance rig with the dot
// grid spanning exactly one tile), so adjacent screens share exact pixels at
// their seams. Videos stay mounted forever — remounting resets a video's
// loop clock and breaks the "one continuous world" illusion during slides.
type TileSet = Record<string, { src: string; poster: string }>

const TILE_SETS: Record<BgMode, TileSet> = {
  ocean: {
    home: { src: oceanHomeMp4, poster: oceanHomePoster },
    design: { src: oceanLeftMp4, poster: oceanLeftPoster }, // left of home
    dev: { src: oceanRightMp4, poster: oceanRightPoster }, // right of home
    about: { src: oceanUpMp4, poster: oceanUpPoster }, // above home
    life: { src: oceanDownMp4, poster: oceanDownPoster }, // below home
  },
  halftone: {
    home: { src: halftoneHomeMp4, poster: halftoneHomePoster },
    design: { src: halftoneLeftMp4, poster: halftoneLeftPoster },
    dev: { src: halftoneRightMp4, poster: halftoneRightPoster },
    about: { src: halftoneUpMp4, poster: halftoneUpPoster },
    life: { src: halftoneDownMp4, poster: halftoneDownPoster },
  },
}

// Ocean renders below, halftone above: the mode crossfade only ever animates
// the halftone layer's opacity, so the visible frame never dips toward the
// dark base color mid-fade.
const SET_ORDER: BgMode[] = ['ocean', 'halftone']

const SCREEN_IDS = Object.keys(TILE_SETS.ocean)

const OFFSETS: Record<Direction, { x: string; y: string }> = {
  up: { x: '0%', y: '-100%' },
  down: { x: '0%', y: '100%' },
  left: { x: '-100%', y: '0%' },
  right: { x: '100%', y: '0%' },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const slideTransition = {
  duration: 0.6,
  ease: [0.33, 1, 0.68, 1] as const,
}

const LOOP_SECONDS = 20
const SYNC_THRESHOLD_S = 0.08

// A set contributes pixels when its opacity is nonzero: halftone (on top) at
// blend > 0, ocean (underneath) at blend < 1.
function isSetVisible(mode: BgMode, blend: number) {
  return mode === 'halftone' ? blend > 0 : blend < 1
}

export default function OceanBackground() {
  const activeScreenId = useNavStore((s) => s.activeScreenId)
  const animDirection = useNavStore((s) => s.animDirection)
  const bgBlend = useNavStore((s) => s.bgBlend)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  // Track the previous screen during render so the background starts sliding
  // in the same commit as the World's screen transition.
  const [pair, setPair] = useState({ current: activeScreenId, prev: null as string | null })
  if (pair.current !== activeScreenId) {
    setPair({ current: activeScreenId, prev: pair.current })
  }

  // Videos drift a few ms per loop restart; nudge the incoming tile onto the
  // outgoing tile's clock at nav time, when the correction is invisible.
  // Every visible set gets synced — mid-blend both contribute pixels.
  useEffect(() => {
    if (!pair.prev) return
    const blend = useNavStore.getState().bgBlend
    for (const mode of SET_ORDER) {
      if (!isSetVisible(mode, blend)) continue
      const inc = videoRefs.current[`${mode}:${pair.current}`]
      const out = videoRefs.current[`${mode}:${pair.prev}`]
      if (!inc || !out || inc.readyState < 2 || out.readyState < 2) continue
      // loop lengths differ per set (ocean 20s, halftone 25s), so wrap-check
      // against the real duration, not the LOOP_SECONDS fallback
      const dur = Number.isFinite(out.duration) && out.duration > 0 ? out.duration : LOOP_SECONDS
      const d = Math.abs(inc.currentTime - out.currentTime)
      if (Math.min(d, dur - d) > SYNC_THRESHOLD_S) {
        inc.currentTime = out.currentTime
      }
    }
  }, [pair])

  // The dial dragging a parked set back into view: seat it on the visible
  // set's clock so the mix shows one moment of the same world, and park it
  // again the instant the dial rests at an extreme (paused videos cost no
  // decode). Runs on every blend tick but only acts on visibility edges.
  const visRef = useRef({
    ocean: isSetVisible('ocean', bgBlend),
    halftone: isSetVisible('halftone', bgBlend),
  })
  useEffect(() => {
    for (const mode of SET_ORDER) {
      const visible = isSetVisible(mode, bgBlend)
      if (visible === visRef.current[mode]) continue
      visRef.current[mode] = visible
      if (!visible) {
        for (const id of SCREEN_IDS) videoRefs.current[`${mode}:${id}`]?.pause()
        continue
      }
      const other: BgMode = mode === 'halftone' ? 'ocean' : 'halftone'
      const out = videoRefs.current[`${other}:${useNavStore.getState().activeScreenId}`]
      const t = out?.currentTime ?? 0
      for (const id of SCREEN_IDS) {
        const v = videoRefs.current[`${mode}:${id}`]
        if (!v) continue
        const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : LOOP_SECONDS
        v.currentTime = t % dur
        v.play().catch(() => {})
      }
    }
  }, [bgBlend])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const playVisible = () => {
      const blend = useNavStore.getState().bgBlend
      for (const mode of SET_ORDER) {
        if (!isSetVisible(mode, blend)) continue
        for (const id of SCREEN_IDS) {
          videoRefs.current[`${mode}:${id}`]?.play().catch(() => {})
        }
      }
    }
    playVisible() // muted autoplay is allowed, but retry on first input just in case
    window.addEventListener('pointerdown', playVisible, { once: true })
    return () => window.removeEventListener('pointerdown', playVisible)
  }, [])

  return (
    <div className={styles.layer} aria-hidden="true">
      {SET_ORDER.map((mode) => (
        <div
          key={mode}
          className={styles.set}
          style={mode === 'halftone' ? { opacity: bgBlend } : undefined}
        >
          {SCREEN_IDS.map((id) => {
            const isActive = id === pair.current
            const isLeaving = id === pair.prev && animDirection !== null
            const dir = animDirection
            let animate
            if (isActive) {
              animate =
                dir && pair.prev
                  ? { x: [OFFSETS[dir].x, '0%'], y: [OFFSETS[dir].y, '0%'] }
                  : { x: '0%', y: '0%' }
            } else if (isLeaving && dir) {
              const exit = OFFSETS[OPPOSITE[dir]]
              animate = { x: ['0%', exit.x], y: ['0%', exit.y] }
            } else {
              // parked offscreen; keeps playing so the shared clock never resets
              animate = { x: '0%', y: '120%' }
            }
            return (
              <motion.div
                key={id}
                className={styles.tile}
                initial={false}
                animate={animate}
                transition={isActive || isLeaving ? slideTransition : { duration: 0 }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[`${mode}:${id}`] = el
                  }}
                  className={styles.video}
                  src={TILE_SETS[mode][id].src}
                  poster={TILE_SETS[mode][id].poster}
                  muted
                  loop
                  playsInline
                  autoPlay={isSetVisible(mode, bgBlend)}
                  preload="auto"
                />
              </motion.div>
            )
          })}
        </div>
      ))}
      <div className={styles.scrim} />
    </div>
  )
}
