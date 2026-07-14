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
      className="fixed bottom-0 left-0 right-0 z-50 overflow-x-auto"
      style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4 md:gap-6 min-w-max">
        <Link href={`/${locale}`} className="shrink-0">
          <Logo className="h-5" />
        </Link>

        <div className="w-px h-5" style={{ backgroundColor: 'var(--border)' }} />

        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={item.key}
              href={href}
              className="relative text-sm font-medium transition-colors shrink-0 pb-1"
              style={{
                color: isActive ? 'var(--chart-2)' : 'var(--muted-foreground)',
              }}
            >
              {labels[item.key][locale as 'uz' | 'en']}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
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
