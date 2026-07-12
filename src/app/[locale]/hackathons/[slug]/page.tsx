import { getPayloadClient } from '@/utilities/getPayload'
import { renderRichText } from '@/utilities/richText'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'hackathons',
    where: { slug: { equals: slug } },
    locale: locale as 'uz' | 'en',
    depth: 2,
  })

  if (docs.length === 0) notFound()

  const hack = docs[0]

  const label = locale === 'uz'
    ? { mentors: 'Mentorlar', projects: "Loyihalar", stage: 'Bosqich', related: "Tegishli maqolalar" }
    : { mentors: 'Mentors', projects: 'Projects', stage: 'Stage', related: 'Related Articles' }

  const stageColors: Record<string, string> = {
    Problem: 'bg-red-100 text-red-700',
    Design: 'bg-blue-100 text-blue-700',
    Build: 'bg-yellow-100 text-yellow-700',
    Test: 'bg-purple-100 text-purple-700',
    Iterate: 'bg-orange-100 text-orange-700',
    Result: 'bg-green-100 text-green-700',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {hack.coverImage && typeof hack.coverImage === 'object' && hack.coverImage.url && (
        <div className="aspect-video overflow-hidden mb-8 bg-muted" style={{ borderRadius: 'var(--radius)' }}>
          <img src={hack.coverImage.url} alt={hack.title || ''} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{hack.title}</h1>

      {hack.summary && <p className="text-lg text-muted-foreground mb-6">{hack.summary}</p>}

      {hack.dateRange?.start && (
        <p className="text-sm text-muted-foreground mb-8">
          {new Date(hack.dateRange.start).toLocaleDateString()}
          {hack.dateRange.end && ` — ${new Date(hack.dateRange.end).toLocaleDateString()}`}
        </p>
      )}

      {hack.mentors && hack.mentors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{label.mentors}</h2>
          <div className="flex flex-wrap gap-4">
            {hack.mentors.map((mentor: any) => (
              <Link
                key={mentor.id}
                href={`/${locale}/mentors/${mentor.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted" style={{ borderRadius: 'var(--radius)' }}
              >
                {mentor.photo && typeof mentor.photo === 'object' && mentor.photo.url && (
                  <img src={mentor.photo.url} alt={mentor.name} className="w-8 h-8 rounded-full object-cover" />
                )}
                <span className="text-sm font-medium">{mentor.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {hack.buildLog && hack.buildLog.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Build Log</h2>
          <div className="space-y-6">
            {hack.buildLog.map((entry: any, i: number) => (
              <div key={i} className="border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${stageColors[entry.stage] || 'bg-muted'}`}>
                    {label.stage}: {entry.stage}
                  </span>
                </div>
                <div className="prose max-w-none">{renderRichText(entry.content as any)}</div>
                {entry.media && entry.media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                    {entry.media.map((m: any, j: number) => (
                      m.image && typeof m.image === 'object' && m.image.url && (
                        <img key={j} src={m.image.url} alt="" className="rounded object-cover aspect-video" />
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {hack.relatedProjects && hack.relatedProjects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{label.projects}</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {hack.relatedProjects.map((project: any) => (
              <Link
                key={project.id}
                href={`/${locale}/projects/${project.slug}`}
                className="border border-border p-4 hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
              >
                <h3 className="font-semibold">{project.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
