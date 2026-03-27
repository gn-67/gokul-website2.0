import NavHint from '../NavHint/NavHint'
import { getNavHintsForScreen } from '../../store/useNavStore'
import styles from './Screen.module.css'

interface ScreenProps {
  id: string
  label: string
  color: string
}

export default function Screen({ id, label, color }: ScreenProps) {
  return (
    <div className={styles.screen} style={{ backgroundColor: color }}>
      <h1 className={styles.label}>{label}</h1>
      {getNavHintsForScreen(id).map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
