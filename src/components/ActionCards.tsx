import Link from 'next/link'
import { BookOpen, Users, Wrench } from 'lucide-react'

/**
 * Three routes into the site. No "read" card by design — the article feed
 * directly above already covers reading.
 *
 * Descriptions are placeholders pending real Uzbek copy.
 */
const CARDS = [
  {
    key: 'learn',
    href: '/quiz',
    Icon: BookOpen,
    uz: { title: "O'rgan", desc: 'Maqolalar asosidagi quizlar bilan bilimingizni sinang.' },
    en: { title: 'Learn', desc: 'Test what you know with quizzes built from the articles.' },
  },
  {
    key: 'join',
    href: '/hackathons',
    Icon: Users,
    uz: { title: 'Qatnash', desc: 'Hakatonlar va jamoaviy tadbirlarda ishtirok eting.' },
    en: { title: 'Participate', desc: 'Join hackathons and community events.' },
  },
  {
    key: 'build',
    href: '/projects',
    Icon: Wrench,
    uz: { title: 'Yarat', desc: 'Oʻz loyihangizni ulashing va boshqalarnikini koʻring.' },
    en: { title: 'Create', desc: 'Share your project and explore what others built.' },
  },
] as const

export function ActionCards({ locale }: { locale: string }) {
  const uz = locale === 'uz'
  const open = uz ? 'Ochish' : 'Open'

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ key, href, Icon, ...copy }) => {
          const text = uz ? copy.uz : copy.en
          return (
            <li key={key}>
              <Link
                href={`/${locale}${href}`}
                className="group flex h-full flex-col border p-6 transition-colors duration-150 hover:border-accent"
                style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
              >
                <span
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center border text-muted-foreground transition-colors duration-150 group-hover:text-accent"
                  style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>

                <h3 className="font-display text-lg font-semibold">{text.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{text.desc}</p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  {open}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
