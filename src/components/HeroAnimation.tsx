'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { F1BlueprintAnimation } from '@/components/ui/f1-blueprint-animation'
import { GearBlueprint } from '@/components/ui/gear-blueprint'

interface HeroAnimationConfig {
  interval: number
  transitionDuration: number
  animationSpeed: number
  strokeWidth: number
  lineColor: string
}

const defaultConfig: HeroAnimationConfig = {
  interval: 5,
  transitionDuration: 1.2,
  animationSpeed: 1,
  strokeWidth: 1.5,
  lineColor: '#ffffff',
}

export function HeroAnimation({
  config: uc,
  className,
}: {
  config?: Partial<HeroAnimationConfig>
  className?: string
}) {
  const cfg = { ...defaultConfig, ...uc }
  const f1Ref = useRef<HTMLDivElement>(null)
  const gearRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const f1 = f1Ref.current
    const gear = gearRef.current
    if (!f1 || !gear) return

    const tl = gsap.timeline({ repeat: -1 })

    tl.set(f1, { opacity: 1, scale: 1 })
    tl.set(gear, { opacity: 0, scale: 0.95 })
    tl.to({}, { duration: cfg.interval })

    tl.to(f1, { opacity: 0, scale: 0.95, duration: cfg.transitionDuration, ease: 'power2.inOut' }, 0)
    tl.to(gear, { opacity: 1, scale: 1, duration: cfg.transitionDuration, ease: 'power2.inOut' }, 0)

    tl.to({}, { duration: cfg.interval })

    tl.to(gear, { opacity: 0, scale: 0.95, duration: cfg.transitionDuration, ease: 'power2.inOut' }, 0)
    tl.to(f1, { opacity: 1, scale: 1, duration: cfg.transitionDuration, ease: 'power2.inOut' }, 0)

    return () => {
      tl.kill()
      gsap.set(f1, { clearProps: 'all' })
      gsap.set(gear, { clearProps: 'all' })
    }
  }, [cfg.interval, cfg.transitionDuration])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('relative w-full h-full overflow-hidden rounded-lg', className)}
      style={{ background: '#0a0a0a', minHeight: '320px' }}
    >
      <div ref={f1Ref} className="absolute inset-0">
        <F1BlueprintAnimation
          config={{
            animationSpeed: cfg.animationSpeed,
            strokeWidth: cfg.strokeWidth,
            lineColor: cfg.lineColor,
            backgroundColor: 'transparent',
          }}
          className="h-full"
        />
      </div>
      <div ref={gearRef} className="absolute inset-0">
        <GearBlueprint
          config={{
            animationSpeed: cfg.animationSpeed,
            strokeWidth: cfg.strokeWidth,
            lineColor: cfg.lineColor,
            backgroundColor: 'transparent',
          }}
          className="h-full"
        />
      </div>
    </div>
  )
}
