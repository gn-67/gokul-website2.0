import { useState } from 'react'
import { motion } from 'framer-motion'
import { getNavHintsForScreen } from '../../store/useNavStore'
import { useScrambleText } from '../../hooks/useScrambleText'
import NavHint from '../NavHint/NavHint'
import PlaceholderImage from '../PlaceholderImage/PlaceholderImage'
import { EXPERIENCES, SHELF_PIECES } from '../../data/experiences'
import styles from './StudioScreen.module.css'

function ScrambleLine({ text, className }: { text: string; className?: string }) {
  const chars = useScrambleText(text)
  return (
    <span className={className}>
      {chars.map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </span>
  )
}

function TimelineEntry({
  period,
  title,
  org,
  blurb,
  index,
}: {
  period: string
  title: string
  org: string
  blurb: string
  index: number
}) {
  // Remounting ScrambleLine on hover re-runs the scramble reveal.
  const [hoverKey, setHoverKey] = useState(0)

  return (
    <motion.li
      className={styles.entry}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.55 + index * 0.12 }}
      onMouseEnter={() => setHoverKey((k) => k + 1)}
    >
      <span className={styles.node} />
      <span className={styles.period}>{period}</span>
      <ScrambleLine key={hoverKey} text={title} className={styles.entryTitle} />
      <span className={styles.org}>{org}</span>
      <span className={styles.blurb}>{blurb}</span>
    </motion.li>
  )
}

export default function StudioScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.timelineSide}>
          <span className={styles.kicker}>studio</span>
          <ScrambleLine text="experiences" className={styles.heading} />
          <div className={styles.timeline}>
            <motion.span
              className={styles.line}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.33, 1, 0.68, 1] }}
            />
            <ul className={styles.entries}>
              {EXPERIENCES.map((exp, i) => (
                <TimelineEntry
                  key={exp.id}
                  period={exp.period}
                  title={exp.title}
                  org={exp.org}
                  blurb={exp.blurb}
                  index={i}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.shelf}>
          {SHELF_PIECES.map((piece, i) => (
            <motion.div
              key={piece.id}
              className={styles.shelfFrame}
              style={{ zIndex: i + 1 }}
              initial={{ opacity: 0, y: 20, rotate: piece.rotate + 4 }}
              animate={{ opacity: 1, y: 0, rotate: piece.rotate }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.15 }}
              whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
            >
              <PlaceholderImage variant="photo" aspectRatio="4 / 5" label={piece.label} />
            </motion.div>
          ))}
        </div>
      </div>

      {getNavHintsForScreen('design').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
