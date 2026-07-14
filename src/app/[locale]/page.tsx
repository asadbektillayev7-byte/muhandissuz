import Link from 'next/link'
import { HeroDiagram } from '@/components/HeroDiagram'
import { StatsStrip } from '@/components/StatsStrip'
import { DisciplineIndex } from '@/components/DisciplineIndex'
import { PartnerMarquee } from '@/components/PartnerMarquee'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const content = locale === 'uz' ? {
    eyebrow: 'MUHANDISLIK · O\'ZBEKISTON',
    headline: 'Muhandislik \nkelajakni \nquradi',
    support: 'Biz muhandislik maqolalari, hackathonlar va talabalar loyihalari orqali yosh muhandislarni qo\'llab-quvvatlaymiz.',
    ctaPrimary: 'Maqolalar',
    ctaPrimaryHref: `/${locale}/articles`,
    ctaSecondary: 'Hackathonlar',
    ctaSecondaryHref: `/${locale}/hackathons`,
  } : {
    eyebrow: 'ENGINEERING · UZBEKISTAN',
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
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-chart-2 mb-4 uppercase">
              {content.eyebrow}
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 whitespace-pre-line"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {content.headline}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              {content.support}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={content.ctaPrimaryHref}
                className="px-5 py-2.5 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {content.ctaPrimary}
              </Link>
              <Link
                href={content.ctaSecondaryHref}
                className="px-5 py-2.5 text-sm font-medium border border-border text-foreground hover:border-chart-2 hover:text-chart-2 transition-colors"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {content.ctaSecondary}
              </Link>
            </div>
          </div>
          <div>
            <HeroDiagram />
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsStrip locale={locale} />

      {/* Partners */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">
          {locale === 'uz' ? 'Hamkorlarimiz' : 'Our Partners'}
        </h2>
        <PartnerMarquee />
      </section>

      {/* Disciplines */}
      <DisciplineIndex locale={locale} />
    </>
  )
}
