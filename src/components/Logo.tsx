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
      src={isDark ? '/logo/muhandis-logo-white.png' : '/logo/muhandis-logo-black.png'}
      alt="Muhandiss.uz"
      className={cn('h-12 w-auto shrink-0', className)}
    />
  )
}
