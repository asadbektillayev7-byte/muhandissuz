'use client'

import { F1TunnelDrive } from '@/components/ui/F1TunnelDrive'

export function HeroAnimation({
  className,
}: {
  className?: string
}) {
  return (
    <F1TunnelDrive
      config={{ speed: 0.15, carBob: 0.3, fogDensity: 0.035 }}
      className={className}
    />
  )
}
