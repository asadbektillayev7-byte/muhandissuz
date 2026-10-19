'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  HERO_IMAGE_GAP, HERO_PIXELS_PER_SECOND,
  hasImageDimensions, heroImageSize, shuffleHeroImages,
  type HeroMediaImage, type ImageDimensions,
} from '@/lib/hero-media'
import styles from './hero-media.module.css'

const ORDER_KEY = 'muhandiss:hero-order:v1'

export function HeroMediaMarqueeClient({ images }: { images: HeroMediaImage[] }) {
  const [ordered, setOrdered] = useState(images)
  const [initialized, setInitialized] = useState(false)
  const [dimensions, setDimensions] = useState<Record<number, ImageDimensions>>({})
  const [failed, setFailed] = useState<Set<number>>(() => new Set())
  const [originalSource, setOriginalSource] = useState<Set<number>>(() => new Set())
  const [viewportWidth, setViewportWidth] = useState(1024)
  const viewport = useRef<HTMLDivElement>(null)
  const initializedFor = useRef<HeroMediaImage[] | null>(null)

  useEffect(() => {
    const available = images.filter(image => !failed.has(image.id))
      .map(image => hasImageDimensions(image) ? image : { ...image, ...dimensions[image.id] })
    if (!available.every(hasImageDimensions)) return

    function shuffle() {
      let previousOrder: number[] = []
      try {
        const stored = sessionStorage.getItem(ORDER_KEY)
        const parsed: unknown = stored ? JSON.parse(stored) : null
        if (Array.isArray(parsed)) previousOrder = parsed.filter(id => typeof id === 'number' && Number.isFinite(id))
      } catch { /* Shuffling still works when browser storage is unavailable. */ }
      const next = shuffleHeroImages(available, previousOrder)
      setOrdered(next)
      setInitialized(true)
      try {
        sessionStorage.setItem(ORDER_KEY, JSON.stringify(next.map(image => image.id)))
      } catch { /* Storage is optional. */ }
    }
    // Wait for legacy dimensions before choosing the small-to-large order.
    // The server still renders deterministically, avoiding hydration mismatches.
    if (initializedFor.current !== images) {
      initializedFor.current = images
      shuffle()
    }
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) shuffle() }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [images, dimensions, failed])

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const measure = () => setViewportWidth(element.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const visible = ordered.filter(image => !failed.has(image.id))
  const sizeFor = (image: HeroMediaImage) => hasImageDimensions(image) ? image : dimensions[image.id] ?? image
  // The masked track is 170% of its column; each full photo fits that column.
  const layoutFor = (image: HeroMediaImage) => heroImageSize(sizeFor(image), viewportWidth / 1.7)
  const baseWidth = visible.reduce((sum, image) => sum + layoutFor(image).width + HERO_IMAGE_GAP, 0)
  // A short catalogue still fills the viewport before the second copy begins.
  const repeats = baseWidth > 0 ? Math.max(1, Math.ceil(viewportWidth / baseWidth)) : 1
  const unit = Array.from({ length: repeats }, () => visible).flat()
  const unitWidth = baseWidth * repeats
  const ready = initialized && visible.every(image => hasImageDimensions(sizeFor(image)))

  function recordDimensions(image: HeroMediaImage, element: HTMLImageElement) {
    if (hasImageDimensions(image) || !element.naturalWidth || !element.naturalHeight) return
    const width = element.naturalWidth, height = element.naturalHeight
    setDimensions(current => current[image.id]?.width === width && current[image.id]?.height === height
      ? current : { ...current, [image.id]: { width, height } })
  }

  if (!visible.length) return null

  return (
    <div className={styles.hero} aria-hidden="true">
      <div ref={viewport} className={styles.viewport}>
        <div
          className={`hero-marquee-track ${styles.track}`}
          data-ready={ready}
          style={{
            visibility: initialized ? 'visible' : 'hidden',
            animationDuration: `${unitWidth / HERO_PIXELS_PER_SECOND}s`,
            animationPlayState: ready ? 'running' : 'paused',
          }}
        >
          {[0, 1].map(copy => (
            <div key={copy} className={styles.group} data-hero-copy={copy} style={{ gap: HERO_IMAGE_GAP, paddingRight: HERO_IMAGE_GAP }}>
              {unit.map((image, i) => {
                const { width, height } = layoutFor(image)
                return (
                  <div key={`${image.id}-${i}`} data-media-id={image.id} className={styles.frame} style={{ width, height }}>
                    <Image
                      src={image.url} alt="" width={640} height={Math.round(640 * height / width)}
                      sizes={`${Math.ceil(width)}px`} className={styles.image}
                      // Resolve legacy dimensions before starting the loop. Both copies
                      // share URLs, so the browser reuses these small optimized images.
                      loading={copy === 0 && i < visible.length ? 'eager' : 'lazy'}
                      unoptimized={originalSource.has(image.id)}
                      onLoad={event => recordDimensions(image, event.currentTarget)}
                      onError={event => {
                        // A thumbnail service timeout must not discard a valid upload.
                        if (event.currentTarget.currentSrc.includes('/_next/image?')) {
                          setOriginalSource(current => current.has(image.id) ? current : new Set(current).add(image.id))
                        } else {
                          setFailed(current => current.has(image.id) ? current : new Set(current).add(image.id))
                        }
                      }}
                      draggable={false}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
