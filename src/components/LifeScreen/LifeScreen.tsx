import { motion } from 'framer-motion'
import { getNavHintsForScreen } from '../../store/useNavStore'
import NavHint from '../NavHint/NavHint'
import PlaceholderImage from '../PlaceholderImage/PlaceholderImage'
import { LIFE_PHOTOS } from '../../data/lifePhotos'
import styles from './LifeScreen.module.css'

export default function LifeScreen() {
  return (
    <div className={styles.screen}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        life, lately
        <svg
          className={styles.squiggle}
          viewBox="0 0 120 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M2 8 C 20 2, 35 11, 55 6 S 95 3, 118 7"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.h2>

      {LIFE_PHOTOS.map((photo, i) => (
        <motion.div
          key={photo.id}
          className={styles.photo}
          style={{
            left: photo.x,
            top: photo.y,
            width: photo.width,
            zIndex: photo.z ?? 1,
          }}
          initial={{ opacity: 0, y: -24, rotate: photo.rotate + 6 }}
          animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 18,
            delay: 0.3 + i * 0.07,
          }}
          whileHover={{
            rotate: photo.rotate * 0.3,
            scale: 1.05,
            zIndex: 50,
          }}
        >
          {photo.decoration === 'tape' && <span className={styles.tape} />}
          {photo.decoration === 'pin' && <span className={styles.pin} />}
          <PlaceholderImage
            variant="polaroid"
            aspectRatio={photo.aspectRatio ?? '4 / 3'}
            label={photo.label}
            caption={photo.caption}
            src={photo.src}
          />
        </motion.div>
      ))}

      {getNavHintsForScreen('life').map((hint) => (
        <NavHint key={hint.direction} direction={hint.direction} label={hint.label} />
      ))}
    </div>
  )
}
