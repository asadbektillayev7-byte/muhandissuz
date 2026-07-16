'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

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

function LogoMark() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0">
      <g stroke="currentColor" className="text-muted-foreground">
        <circle cx="30" cy="30" r="18" strokeWidth="2.5" />
        <circle cx="30" cy="30" r="8" strokeWidth="2" />
        <line x1="30" y1="8" x2="30" y2="16" strokeWidth="2.5" />
        <line x1="30" y1="44" x2="30" y2="52" strokeWidth="2.5" />
        <line x1="8" y1="30" x2="16" y2="30" strokeWidth="2.5" />
        <line x1="44" y1="30" x2="52" y2="30" strokeWidth="2.5" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" strokeWidth="2" />
        <line x1="40" y1="40" x2="45.5" y2="45.5" strokeWidth="2" />
        <line x1="45.5" y1="14.5" x2="40" y2="20" strokeWidth="2" />
        <line x1="20" y1="40" x2="14.5" y2="45.5" strokeWidth="2" />
      </g>
    </svg>
  )
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
      <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 h-14 min-w-max">
        <Link href={`/${locale}`} className="shrink-0 flex items-center">
          <LogoMark />
        </Link>

        <div className="w-px h-6 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = pathname.startsWith(href)

          return (
            <Link
              key={item.key}
              href={href}
              className="relative text-base font-medium transition-colors duration-200 shrink-0"
              style={{
                color: isActive ? 'var(--chart-2)' : 'var(--muted-foreground)',
              }}
            >
              <span className="hover:text-chart-2 transition-colors duration-200">
                {labels[item.key][locale as 'uz' | 'en']}
              </span>
              {isActive && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5"
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
