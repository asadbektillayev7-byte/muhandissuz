import { getPayloadClient } from '@/utilities/getPayload'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayloadClient()

  const settings = await payload.findGlobal({
    slug: 'site-settings',
    locale: locale as 'uz' | 'en',
    depth: 0,
  })

  const articlesResult = await payload.find({
    collection: 'articles',
    locale: locale as 'uz' | 'en',
    depth: 0,
    limit: 0,
  })

  const hackathonsResult = await payload.find({
    collection: 'hackathons',
    locale: locale as 'uz' | 'en',
    depth: 0,
    limit: 0,
  })

  const projectsResult = await payload.find({
    collection: 'student-projects',
    locale: locale as 'uz' | 'en',
    depth: 0,
    limit: 0,
  })

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

      {settings.missionStatement && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{content.mission}</h2>
          <p className="text-muted-foreground">{settings.missionStatement}</p>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">{content.stats}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{articlesResult.totalDocs}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.articlesLabel}</div>
          </div>
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{hackathonsResult.totalDocs}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.hackathonsLabel}</div>
          </div>
          <div className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <div className="text-3xl font-bold text-chart-2">{projectsResult.totalDocs}</div>
            <div className="text-sm text-muted-foreground mt-1">{content.projectsLabel}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
