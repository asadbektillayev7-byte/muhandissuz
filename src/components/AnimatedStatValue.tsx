'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function AnimatedStatValue({ value, label }: { value: number; label: string }) {
  const [displayed, setDisplayed] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const animate = useCallback((target: number, duration: number) => {
    const start = performance.now()
    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      setDisplayed(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            animate(value, 1200)
            setHasAnimated(true)
            observer.unobserve(el)
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, animate, hasAnimated])

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl font-semibold font-sans" style={{ fontWeight: 600 }}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-2 mr-1.5 align-middle animate-pulse" />
        <span className="align-middle">{displayed}</span>
      </div>
      <div className="text-xs font-mono text-muted-foreground mt-0.5 tracking-wider uppercase">
        {label}
      </div>
    </div>
  )
}
