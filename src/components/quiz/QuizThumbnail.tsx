'use client'

import { useState } from 'react'
import { MurvachchaMascot } from '@/components/MurvachchaMascot'
import styles from './quiz-art.module.css'

const ART: Record<string, string> = {
  ai: 'ai',
  'mechanical-engineering': 'mechanical',
  'electrical-engineering': 'electrical',
  'civil-engineering': 'civil',
  'chemical-engineering': 'chemical',
  'environmental-engineering': 'environmental',
  'motorsports-engineering': 'motorsports',
}

/** Shared by featured, library, and compact recommendation cards. */
export function QuizThumbnail({
  src, alt, category, className = 'aspect-[16/10]', featured = false, locale = 'uz',
}: {
  src: string | null
  alt: string
  category?: string | null
  className?: string
  featured?: boolean
  locale?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const cover = src && src !== failedSrc ? src : null
  const topic = (category && ART[category]) || 'general'

  return (
    <div className={`${styles.art} ${featured ? styles.featuredArt : ''} ${className}`} data-topic={topic}>
      {cover ? (
        <img
          key={cover} src={cover} alt={alt} width={800} height={500}
          loading={featured ? 'eager' : 'lazy'} decoding="async"
          className={styles.cover} onError={() => setFailedSrc(cover)}
        />
      ) : (
        <>
          <span className={styles.orbit} aria-hidden="true" />
          <span className={styles.spark} aria-hidden="true">✦</span>
          <span className={styles.dot} aria-hidden="true" />
          <img
            src={`/images/quiz/${topic}.webp`} alt="" width={512} height={512}
            loading={featured ? 'eager' : 'lazy'} decoding="async" className={styles.illustration}
          />
        </>
      )}
      {featured && (
        <div className={styles.companion}>
          <span className={styles.mascot}><MurvachchaMascot state="greeting" /></span>
          <span className={styles.speech}>
            <span className={styles.speaker}>Murvachcha</span>
            {locale === 'uz' ? 'Birga sinab ko‘ramizmi?' : 'Ready to try it together?'}
          </span>
        </div>
      )}
    </div>
  )
}
