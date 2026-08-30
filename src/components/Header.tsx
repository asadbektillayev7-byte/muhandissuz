'use client'

import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { FlagLanguageToggle } from './FlagLanguageToggle'
import { ThemeToggle } from './ThemeToggle'

/**
 * Deliberately minimal: no logo, no nav links, no Telegram button. Page
 * navigation lives in the bottom pill nav. Slimmed to h-14 since two small
 * controls in an h-20 bar left a large empty band.
 */
export function Header() {
  const pathname = usePathname()
  // The homepage gets the one-click flag toggle; every other page keeps the
  // labelled dropdown, where the language names are worth the extra click.
  const isHome = /^\/(uz|en)\/?$/.test(pathname)

  return (
    <header>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-end gap-3">
        {isHome ? <FlagLanguageToggle /> : <LanguageSwitcher />}
        <span className="w-px h-4 bg-border" />
        <ThemeToggle />
      </div>
    </header>
  )
}
