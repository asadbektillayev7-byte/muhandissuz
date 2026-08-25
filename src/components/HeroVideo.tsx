'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Add a clip = add one entry. With a single entry nothing ever switches. */
const CLIPS = [{ src: '/videos/gears.mp4', poster: '/videos/gears-poster.jpg' }]

/** How long each clip is held before advancing. Only used with 2+ clips. */
const CLIP_INTERVAL_MS = 10_000
const CROSSFADE_MS = 800

/** Intrinsic size of the footage — fixes the panel's aspect so it never resizes. */
const ASPECT = '898 / 506'

/**
 * Single dark value for the panel in both themes: within a few points of the
 * dark page background so it reads as a barely-lifted surface there, and a
 * deliberate dark "technical viewport" card against the light background.
 */
const PANEL_BG = '#17181a'
const PANEL_BORDER = 'rgba(255,255,255,0.10)'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export function HeroVideo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const [index, setIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  // Poster only: below md we never mount the video, so no download at all.
  const shouldPlay = isDesktop && !reducedMotion

  // Advance clips. With one clip this effect returns immediately — no timer.
  useEffect(() => {
    if (CLIPS.length < 2 || !shouldPlay) return
    const id = setInterval(() => setIndex((i) => (i + 1) % CLIPS.length), CLIP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [shouldPlay])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const on = () => setTabVisible(!document.hidden)
    on()
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  // Only the active clip plays, and only while on-screen with the tab focused.
  useEffect(() => {
    if (!shouldPlay) return
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === index && inView && tabVisible) {
        const p = v.play()
        if (p) p.catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [shouldPlay, index, inView, tabVisible])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{
        aspectRatio: ASPECT,
        borderRadius: 12,
        background: PANEL_BG,
        border: `1px solid ${PANEL_BORDER}`,
      }}
      aria-hidden="true"
    >
      {/* Poster sits inside the same panel, so nothing shifts when video starts. */}
      <img
        src={CLIPS[index].poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ borderRadius: 12 }}
        draggable={false}
      />

      {shouldPlay &&
        CLIPS.map((clip, i) => (
          <video
            key={clip.src}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            src={clip.src}
            poster={clip.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              borderRadius: 12,
              opacity: i === index ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease`,
            }}
          />
        ))}
    </div>
  )
}
