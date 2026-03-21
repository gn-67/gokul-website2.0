import styles from './Screen.module.css'

interface ScreenProps {
  label: string
  color: string
}

export default function Screen({ label, color }: ScreenProps) {
  return (
    <div className={styles.screen} style={{ backgroundColor: color }}>
      <h1 className={styles.label}>{label}</h1>
    </div>
  )
}
