'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

const links = [
  { key: 'articles', href: '/articles' },
  { key: 'hackathons', href: '/hackathons' },
  { key: 'quiz', href: '/quiz' },
  { key: 'projects', href: '/projects' },
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

export function Footer() {
  const params = useParams()
  const locale = (params.locale as string) || 'uz'

  return (
    <footer className="border-t border-border mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className="text-xs font-mono text-muted-foreground hover:text-foreground tracking-wider uppercase transition-colors"
            >
              {labels[link.key][locale as 'uz' | 'en']}
            </Link>
          ))}
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          &copy; {new Date().getFullYear()} Muhandis.uz
        </p>
      </div>
    </footer>
  )
}
