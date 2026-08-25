'use client'

import { HeroVideo } from '@/components/HeroVideo'

export function HeroAnimation({
  className,
}: {
  className?: string
}) {
  return <HeroVideo className={className} />
}
