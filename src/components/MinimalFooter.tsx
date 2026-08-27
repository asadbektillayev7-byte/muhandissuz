'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Send } from 'lucide-react'
import { Logo } from './Logo'
import { AnimatedMenuItem } from '@/components/ui/animated-menu-item'

const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/Muhandis_e'

/** Every public section of the site lives here — the footer is the sitemap. */
const COLUMNS = [
  {
    heading: { uz: 'Kashf eting', en: 'Explore' },
    links: [
      { href: '/articles', uz: 'Maqolalar', en: 'Articles' },
      { href: '/hackathons', uz: 'Hakatonlar', en: 'Hackathons' },
      { href: '/quiz', uz: 'Quiz', en: 'Quiz' },
      { href: '/projects', uz: 'Loyihalar', en: 'Projects' },
      { href: '/media', uz: 'Media', en: 'Media' },
      { href: '/glossary', uz: 'Lugʻat', en: 'Glossary' },
    ],
  },
  {
    heading: { uz: 'Hamjamiyat', en: 'Community' },
    links: [
      { href: '/team', uz: 'Jamoa', en: 'Team' },
      { href: '/mentors', uz: 'Mentorlar', en: 'Mentors' },
      { href: '/partners', uz: 'Hamkorlar', en: 'Partners' },
    ],
  },
  {
    heading: { uz: 'Muhandiss', en: 'Muhandiss' },
    links: [
      { href: '/about', uz: 'Biz haqimizda', en: 'About' },
      { href: '/contact', uz: 'Aloqa', en: 'Contact' },
      { href: '/feedback', uz: 'Baholash', en: 'Rate Us' },
    ],
  },
] as const

export function MinimalFooter() {
  const params = useParams()
  const locale = (params.locale as string) || 'uz'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-16">
      <div className="bg-[radial-gradient(35%_80%_at_30%_0%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent)] mx-auto max-w-6xl md:border-x border-border">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 p-4 pt-8">
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
              {TELEGRAM_URL && (
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
              <a
                href="https://www.linkedin.com/company/106188701"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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

          {COLUMNS.map((col) => (
            <div key={col.heading.en}>
              <p className="mb-2 text-sm font-semibold">
                {locale === 'uz' ? col.heading.uz : col.heading.en}
              </p>
              <div className="flex flex-col gap-1.5">
                {col.links.map((link) => (
                  <AnimatedMenuItem
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    label={locale === 'uz' ? link.uz : link.en}
                  />
                ))}
              </div>
            </div>
          ))}
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
