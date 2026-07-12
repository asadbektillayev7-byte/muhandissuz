'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = (params.locale as string) || 'uz'

  const pathWithoutLocale = pathname.replace(/^\/(uz|en)/, '') || '/'
  const target = currentLocale === 'uz' ? 'en' : 'uz'

  return (
    <Link
      href={`/${target}${pathWithoutLocale}`}
      className="font-mono text-xs tracking-wider hover:text-chart-2 transition-colors"
    >
      {currentLocale === 'uz' ? 'EN' : 'UZ'}
    </Link>
  )
}
