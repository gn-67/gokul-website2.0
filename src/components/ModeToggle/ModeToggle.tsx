import { useNavStore } from '../../store/useNavStore'
import styles from './ModeToggle.module.css'

// Corner button that swaps the background between the halftone and full-color
// ocean sets. Shows the mode you'd switch TO.
export default function ModeToggle() {
  const bgMode = useNavStore((s) => s.bgMode)
  const loadingComplete = useNavStore((s) => s.loadingComplete)
  const toggleBgMode = useNavStore((s) => s.toggleBgMode)
  const next = bgMode === 'halftone' ? 'ocean' : 'halftone'

  if (!loadingComplete) return null

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleBgMode}
      aria-label={`Switch to ${next} background`}
      title={`Switch to ${next} background`}
    >
      {next === 'ocean' ? (
        // wave lines — the full-color ocean
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 9c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
          <path d="M2 15c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
        </svg>
      ) : (
        // fading dot grid — the halftone treatment
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
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
      )}
    </button>
  )
}
