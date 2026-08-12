'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(stored ? stored === 'dark' : prefers)

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <img
      src="/logo/muhandis-logo.svg"
      alt="Muhandiss.uz"
      width={340}
      height={160}
      fetchPriority="high"
      // The SVG is dark-on-transparent; invert it for the dark theme.
      style={isDark ? { filter: 'invert(1)' } : undefined}
      className={cn('h-8 sm:h-10 md:h-12 w-auto shrink-0', className)}
    />
  )
}
