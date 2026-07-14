'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

export function Header() {
  const params = useParams()
  const locale = (params.locale as string) || 'uz'

  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <span className="w-px h-4 bg-border" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
