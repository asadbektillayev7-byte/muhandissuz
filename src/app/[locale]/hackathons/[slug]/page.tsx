import { getHackathonBySlug } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import { renderRichText } from '@/utilities/richText'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const hack = await getHackathonBySlug(slug, locale)

  if (!hack) notFound()

  const label = locale === 'uz'
    ? { mentors: 'Mentorlar', projects: "Loyihalar", stage: 'Bosqich' }
    : { mentors: 'Mentors', projects: 'Projects', stage: 'Stage' }

  const stageColors: Record<string, string> = {
    Problem: 'bg-red-100 text-red-700',
    Design: 'bg-blue-100 text-blue-700',
    Build: 'bg-yellow-100 text-yellow-700',
    Test: 'bg-purple-100 text-purple-700',
    Iterate: 'bg-orange-100 text-orange-700',
    Result: 'bg-green-100 text-green-700',
  }

  const buildLog = typeof hack.build_log === 'string' ? JSON.parse(hack.build_log) : (hack.build_log || [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {hack.cover_image_url && (
        <div className="aspect-video overflow-hidden mb-8 bg-muted" style={{ borderRadius: 'var(--radius)' }}>
          <img src={hack.cover_image_url} alt={field(hack, 'title', locale)} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{field(hack, 'title', locale)}</h1>

      {field(hack, 'summary', locale) && <p className="text-lg text-muted-foreground mb-6">{field(hack, 'summary', locale)}</p>}

      {hack.date_range_start && (
        <p className="text-sm text-muted-foreground mb-8">
          {new Date(hack.date_range_start).toLocaleDateString()}
          {hack.date_range_end && ` — ${new Date(hack.date_range_end).toLocaleDateString()}`}
        </p>
      )}

      {buildLog.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Build Log</h2>
          <div className="space-y-6">
            {buildLog.map((entry: any, i: number) => (
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
    </div>
  )
}
