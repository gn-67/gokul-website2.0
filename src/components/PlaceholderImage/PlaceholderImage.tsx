import type { CSSProperties } from 'react'
import styles from './PlaceholderImage.module.css'

export interface PlaceholderImageProps {
  /** Text shown inside the placeholder frame until a real asset arrives */
  label: string
  /** When a real asset arrives, pass src — renders an <img>, nothing else changes */
  src?: string
  alt?: string
  /** CSS aspect-ratio, e.g. '16 / 9' */
  aspectRatio?: string
  variant?: 'photo' | 'screenshot' | 'polaroid'
  /** Polaroid only: handwritten caption in the matte area */
  caption?: string
  className?: string
  style?: CSSProperties
}

export default function PlaceholderImage({
  label,
  src,
  alt = '',
  aspectRatio = '4 / 3',
  variant = 'photo',
  caption,
  className,
  style,
}: PlaceholderImageProps) {
  const frame = src ? (
    <img src={src} alt={alt} className={styles.image} style={{ aspectRatio }} />
  ) : (
    <div className={styles.frame} style={{ aspectRatio }}>
      <span className={styles.label}>{label}</span>
    </div>
  )

  if (variant === 'polaroid') {
    return (
      <div className={`${styles.polaroid} ${className ?? ''}`} style={style}>
        {frame}
        {caption && <span className={styles.caption}>{caption}</span>}
      </div>
    )
  }

  if (variant === 'screenshot') {
    return (
      <div className={`${styles.screenshot} ${className ?? ''}`} style={style}>
        <div className={styles.chromeBar}>
          <span className={styles.chromeDot} />
          <span className={styles.chromeDot} />
          <span className={styles.chromeDot} />
        </div>
        {frame}
      </div>
    )
  }

  return (
    <div className={`${styles.photo} ${className ?? ''}`} style={style}>
      {frame}
    </div>
  )
}
