'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Logo } from './Logo'

const navItems = [
  { key: 'articles', href: '/articles' },
  { key: 'hackathons', href: '/hackathons' },
  { key: 'quiz', href: '/quiz' },
  { key: 'projects', href: '/projects' },
  { key: 'team', href: '/team' },
]

const labels: Record<string, { uz: string; en: string }> = {
  articles: { uz: 'Maqolalar', en: 'Articles' },
  hackathons: { uz: 'Hackathonlar', en: 'Hackathons' },
  quiz: { uz: 'Quiz', en: 'Quiz' },
  projects: { uz: 'Loyihalar', en: 'Projects' },
  team: { uz: 'Jamoa', en: 'Team' },
}

export function BottomNav() {
  const params = useParams()
  const pathname = usePathname()
  const locale = (params.locale as string) || 'uz'

  return (
    <nav
      className="fixed z-50 overflow-x-auto"
      style={{
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px -4px rgba(0,0,0,0.15)',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 h-12 min-w-max">
        <Link href={`/${locale}`} className="shrink-0">
          <Logo className="h-5" />
        </Link>

        <div className="w-px h-5 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={item.key}
              href={href}
              className="relative text-sm font-medium transition-colors shrink-0 pb-0.5"
              style={{
                color: isActive ? 'var(--chart-2)' : 'var(--muted-foreground)',
              }}
            >
              {labels[item.key][locale as 'uz' | 'en']}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5"
                  style={{ backgroundColor: 'var(--chart-2)', borderRadius: '1px' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
