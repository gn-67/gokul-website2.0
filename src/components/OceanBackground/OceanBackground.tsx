import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavStore } from '../../store/useNavStore'
import type { Direction } from '../../store/useNavStore'
import homeMp4 from '../../assets/ocean/ocean-home.mp4'
import leftMp4 from '../../assets/ocean/ocean-left.mp4'
import rightMp4 from '../../assets/ocean/ocean-right.mp4'
import upMp4 from '../../assets/ocean/ocean-up.mp4'
import downMp4 from '../../assets/ocean/ocean-down.mp4'
import homePoster from '../../assets/ocean/ocean-home.png'
import leftPoster from '../../assets/ocean/ocean-left.png'
import rightPoster from '../../assets/ocean/ocean-right.png'
import upPoster from '../../assets/ocean/ocean-up.png'
import downPoster from '../../assets/ocean/ocean-down.png'
import styles from './OceanBackground.module.css'

// All five tiles are crops of one Blender render, so adjacent screens share
// exact pixels at their seams. The videos stay mounted and playing forever —
// remounting or pausing would desync their shared clock and break the
// "one continuous world" illusion during slides.
const OCEAN_TILES: Record<string, { src: string; poster: string }> = {
  home: { src: homeMp4, poster: homePoster },
  design: { src: leftMp4, poster: leftPoster }, // left of home
  dev: { src: rightMp4, poster: rightPoster }, // right of home
  about: { src: upMp4, poster: upPoster }, // above home
  life: { src: downMp4, poster: downPoster }, // below home
}

const SCREEN_IDS = Object.keys(OCEAN_TILES)

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

export default function OceanBackground() {
  const activeScreenId = useNavStore((s) => s.activeScreenId)
  const animDirection = useNavStore((s) => s.animDirection)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  // Track the previous screen during render so the background starts sliding
  // in the same commit as the World's screen transition.
  const [pair, setPair] = useState({ current: activeScreenId, prev: null as string | null })
  if (pair.current !== activeScreenId) {
    setPair({ current: activeScreenId, prev: pair.current })
  }

  // Videos drift a few ms per loop restart; nudge the incoming tile onto the
  // outgoing tile's clock at nav time, when the correction is invisible.
  useEffect(() => {
    if (!pair.prev) return
    const inc = videoRefs.current[pair.current]
    const out = videoRefs.current[pair.prev]
    if (!inc || !out || inc.readyState < 2 || out.readyState < 2) return
    const d = Math.abs(inc.currentTime - out.currentTime)
    if (Math.min(d, LOOP_SECONDS - d) > SYNC_THRESHOLD_S) {
      inc.currentTime = out.currentTime
    }
  }, [pair])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const playAll = () => {
      for (const v of Object.values(videoRefs.current)) v?.play().catch(() => {})
    }
    playAll() // muted autoplay is allowed, but retry on first input just in case
    window.addEventListener('pointerdown', playAll, { once: true })
    return () => window.removeEventListener('pointerdown', playAll)
  }, [])

  return (
    <div className={styles.layer} aria-hidden="true">
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
                videoRefs.current[id] = el
              }}
              className={styles.video}
              src={OCEAN_TILES[id].src}
              poster={OCEAN_TILES[id].poster}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
            />
          </motion.div>
        )
      })}
      <div className={styles.scrim} />
    </div>
  )
}
