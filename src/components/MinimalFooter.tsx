'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

const exploreLinks = [
  { key: 'articles', href: '/articles' },
  { key: 'hackathons', href: '/hackathons' },
  { key: 'quiz', href: '/quiz' },
  { key: 'projects', href: '/projects' },
]

const companyLinks = [
  { key: 'partners', href: '/partners' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
]

const labels: Record<string, { uz: string; en: string }> = {
  articles: { uz: 'Maqolalar', en: 'Articles' },
  hackathons: { uz: 'Hackathonlar', en: 'Hackathons' },
  quiz: { uz: 'Quiz', en: 'Quiz' },
  projects: { uz: 'Loyihalar', en: 'Projects' },
  partners: { uz: 'Hamkorlar', en: 'Partners' },
  about: { uz: 'Biz Haqimizda', en: 'About' },
  contact: { uz: 'Aloqa', en: 'Contact' },
}

const columnHeaders: Record<string, { uz: string; en: string }> = {
  explore: { uz: 'Bo\'limlar', en: 'Explore' },
  company: { uz: 'Tashkilot', en: 'Company' },
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
              <img
                src="/logo/muhandis-logo.svg"
                alt="Muhandis.uz"
                className="h-7 w-auto dark:invert"
              />
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm text-balance">
              {locale === 'uz'
                ? 'Muhandislik maqolalari, hackathonlar va talabalar loyihalari portali'
                : 'Engineering articles, hackathons and student projects portal'}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
              {columnHeaders.explore[locale as 'uz' | 'en']}
            </span>
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
            <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
              {columnHeaders.company[locale as 'uz' | 'en']}
            </span>
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
            &copy; {year} Muhandis.uz
          </p>
        </div>
      </div>
    </footer>
  )
}
