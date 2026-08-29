'use client'

import { useEffect, useState } from 'react'
import { THEME_KEY, resolveTheme, scheduledTheme, storedTheme } from '@/lib/theme'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  const apply = (isDark: boolean) => {
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    apply(resolveTheme() === 'dark')

    // Follow the clock while the tab stays open, but never fight a manual
    // choice — once someone picks a theme it sticks until they clear it.
    const tick = () => {
      if (storedTheme()) return
      apply(scheduledTheme() === 'dark')
    }
    const id = setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  function toggle() {
    const next = !dark
    apply(next)
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="p-1.5 hover:text-chart-2 transition-colors"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
