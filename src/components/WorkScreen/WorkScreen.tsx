import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNavHintsForScreen } from '../../store/useNavStore'
import { useScrambleText } from '../../hooks/useScrambleText'
import NavHint from '../NavHint/NavHint'
import PlaceholderImage from '../PlaceholderImage/PlaceholderImage'
import { PROJECTS } from '../../data/projects'
import styles from './WorkScreen.module.css'

const detailTransition = { duration: 0.2, ease: 'easeOut' as const }

function ScrambleTitle({ text }: { text: string }) {
  const chars = useScrambleText(text)
  return (
    <h2 className={styles.title}>
      {chars.map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </h2>
  )
}

export default function WorkScreen() {
  const [selectedId, setSelectedId] = useState(PROJECTS[0].id)
  const selected = PROJECTS.find((p) => p.id === selectedId) ?? PROJECTS[0]

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.detail}>
          <span className={styles.kicker}>work</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              className={styles.detailBody}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={detailTransition}
            >
              <div className={styles.titleRow}>
                <ScrambleTitle text={selected.title} />
                <span className={styles.year}>{selected.year}</span>
              </div>
              <p className={styles.tagline}>{selected.tagline}</p>
              <div className={styles.glassPanel}>
                <p className={styles.description}>{selected.description}</p>
              </div>
              <div className={styles.stack}>
                {selected.stack.map((tech) => (
                  <span key={tech} className={styles.chip}>
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.grid}>
          {PROJECTS.map((project, i) => (
            <motion.button
              key={project.id}
              type="button"
              className={`${styles.card} ${
                project.id === selectedId ? styles.cardSelected : ''
              }`}
              onClick={() => setSelectedId(project.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <PlaceholderImage
                variant="screenshot"
                aspectRatio={project.image.aspectRatio ?? '16 / 9'}
                label={project.image.label}
                src={project.image.src}
                alt={project.title}
              />
              <span className={styles.cardTitle}>{project.title}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {getNavHintsForScreen('dev').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
