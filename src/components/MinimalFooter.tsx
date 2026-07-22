'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Send } from 'lucide-react'
import { Logo } from './Logo'

const exploreLinks = [
  { key: 'articles', href: '/articles' },
  { key: 'hackathons', href: '/hackathons' },
  { key: 'quiz', href: '/quiz' },
  { key: 'projects', href: '/projects' },
]

const companyLinks = [
  { key: 'partners', href: '/partners' },
  { key: 'team', href: '/team' },
  { key: 'contact', href: '/contact' },
]

const labels: Record<string, { uz: string; en: string }> = {
  articles: { uz: 'Maqolalar', en: 'Articles' },
  hackathons: { uz: 'Hakatonlar', en: 'Hackathons' },
  quiz: { uz: 'Quiz', en: 'Quiz' },
  projects: { uz: 'Loyihalar', en: 'Projects' },
  partners: { uz: 'Hamkorlar', en: 'Partners' },
  team: { uz: 'Jamoa', en: 'Team' },
  contact: { uz: 'Aloqa', en: 'Contact' },
}

export function MinimalFooter() {
  const params = useParams()
  const locale = (params.locale as string) || 'uz'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-16">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent)] mx-auto max-w-6xl md:border-x border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-4 pt-8">
          <div className="col-span-2 flex flex-col gap-4">
            <Link href={`/${locale}`} className="w-max">
              <Logo />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm text-balance">
              {locale === 'uz'
                ? 'Muhandislik maqolalari, hackathonlar va talabalar loyihalari portali'
                : 'Engineering articles, hackathons and student projects portal'}
            </p>
            <div className="flex gap-2">
              <a
                href="https://t.me/Muhandis_e"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/106188701"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-1 mt-2">
              {exploreLinks.map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href}`}
                  className="w-max py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {labels[link.key][locale as 'uz' | 'en']}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-1 mt-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href}`}
                  className="w-max py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {labels[link.key][locale as 'uz' | 'en']}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 pt-4">
          <div className="bg-border h-px w-full mb-4" />
          <p className="text-muted-foreground text-center text-xs font-mono">
            &copy; {year} Muhandiss.uz
          </p>
        </div>
      </div>
    </footer>
  )
}
