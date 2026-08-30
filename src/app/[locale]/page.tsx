import Link from 'next/link'
import { StatsStrip } from '@/components/StatsStrip'
import { LatestArticles } from '@/components/LatestArticles'
import { HeroMediaMarquee } from '@/components/HeroMediaMarquee'
import { ActionCards } from '@/components/ActionCards'
import { PartnerMarquee } from '@/components/PartnerMarquee'
import { FeedbackMarquee } from '@/components/FeedbackMarquee'
import { getPartners } from '@/lib/supabase/queries'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const partners = await getPartners()

  const content = locale === 'uz' ? {
    headline: 'Muhandislik \nkelajakni \nquradi',
    support:
      'Muhandiss.uz — talabalar va yosh muhandislar uchun ochiq platforma. Maqolalar, quizlar, hakatonlar va loyihalar, barchasi bepul.',
    // Deliberately not a section link: the pill nav and the action cards below
    // already reach all three sections, and About is the only page that
    // answers "what is this project?".
    ctaPrimary: 'Biz haqimizda',
    ctaPrimaryHref: `/${locale}/about`,
  } : {
    headline: 'Engineering \nbuilds the \nfuture',
    support:
      'Muhandiss.uz is an open platform for students and young engineers. Articles, quizzes, hackathons and projects, all free.',
    ctaPrimary: 'About us',
    ctaPrimaryHref: `/${locale}/about`,
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden max-w-6xl mx-auto px-4 pt-8 pb-14 md:pt-12 md:pb-28">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center relative z-10">
          <div>
            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 whitespace-pre-line"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.headline}
            </h1>
            <p className="font-display text-muted-foreground mb-6 max-w-md">
              {content.support}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={content.ctaPrimaryHref}
                className="px-5 py-2.5 text-sm font-semibold bg-accent text-white transition-colors duration-150 hover:bg-accent-hover"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {content.ctaPrimary}
              </Link>
            </div>
          </div>
          <div>
            <HeroMediaMarquee locale={locale} />
          </div>
        </div>
      </section>

      {/* Latest articles */}
      <LatestArticles locale={locale} />

      {/* Action cards */}
      <ActionCards locale={locale} />

      {/* Stats */}
      <StatsStrip locale={locale} />

      {/* Partners */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-semibold mb-6">
          {locale === 'uz' ? 'Hamkorlarimiz' : 'Our Partners'}
        </h2>
        <PartnerMarquee partners={partners} />
      </section>

      {/* Visitor feedback — last section before the footer */}
      <FeedbackMarquee locale={locale} />
    </>
  )
}
