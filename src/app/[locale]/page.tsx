import Link from 'next/link'
import { StatsStrip } from '@/components/StatsStrip'
import { LatestArticles } from '@/components/LatestArticles'
import { HeroMediaMarquee } from '@/components/HeroMediaMarquee'
import { ActionCards } from '@/components/ActionCards'
import { PartnerMarquee } from '@/components/PartnerMarquee'
import { FeedbackMarquee } from '@/components/FeedbackMarquee'
import { getPartners } from '@/lib/supabase/queries'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const partners = await getPartners()

  const content = locale === 'uz' ? {
    headline: 'Muhandislik \nkelajakni \nquradi',
    support: 'Biz muhandislik maqolalari, hakatonlar va talabalar loyihalari orqali yosh muhandislarni qo\'llab-quvvatlaymiz.',
    ctaPrimary: 'Maqolalar',
    ctaPrimaryHref: `/${locale}/articles`,
    ctaSecondary: 'Hakatonlar',
    ctaSecondaryHref: `/${locale}/hackathons`,
  } : {
    headline: 'Engineering \nbuilds the \nfuture',
    support: 'We promote engineering knowledge through articles, hackathons, and student projects for young engineers.',
    ctaPrimary: 'Articles',
    ctaPrimaryHref: `/${locale}/articles`,
    ctaSecondary: 'Hackathons',
    ctaSecondaryHref: `/${locale}/hackathons`,
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
              <Link
                href={content.ctaSecondaryHref}
                className="px-5 py-2.5 text-sm font-semibold border bg-transparent text-foreground transition-colors duration-150 hover:border-accent hover:text-accent"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {content.ctaSecondary}
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
