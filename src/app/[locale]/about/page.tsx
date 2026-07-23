import { getStats, getSiteSettings } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const [stats, settings] = await Promise.all([
    getStats(),
    getSiteSettings(locale),
  ])

  const content = locale === 'uz' ? {
    title: 'Biz Haqimizda',
    mission: 'Missiya',
    stats: 'Statistika',
    articlesLabel: 'Maqolalar',
    hackathonsLabel: 'Hakatonlar',
    projectsLabel: 'Loyihalar',
    aboutText: 'Muhandiss.uz — bu muhandislik va texnologiyalar sohasida bilimlarni targ\'ib qiluvchi platforma. Biz maqolalar, hakatonlar va talabalar loyihalari orqali yosh muhandislarni qo\'llab-quvvatlaymiz.',
  } : {
    title: 'About Us',
    mission: 'Our Mission',
    stats: 'Statistics',
    articlesLabel: 'Articles',
    hackathonsLabel: 'Hackathons',
    projectsLabel: 'Projects',
    aboutText: 'Muhandiss.uz is a platform that promotes knowledge in engineering and technology. We support young engineers through articles, hackathons, and student projects.',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{content.title}</h1>

      <p className="text-lg text-muted-foreground mb-8">{content.aboutText}</p>

      {settings && field(settings, 'mission_statement', locale) && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{content.mission}</h2>
          <p className="text-muted-foreground">{field(settings, 'mission_statement', locale)}</p>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">{content.stats}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{stats.articles}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.articlesLabel}</div>
          </div>
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{stats.hackathons}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.hackathonsLabel}</div>
          </div>
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{stats.projects}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.projectsLabel}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
