import { getPayloadClient } from '@/utilities/getPayload'
import Link from 'next/link'

export default async function HackathonsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayloadClient()

  const { docs: hackathons } = await payload.find({
    collection: 'hackathons',
    locale: locale as 'uz' | 'en',
    depth: 2,
    sort: '-dateRange.start',
  })

  const label = locale === 'uz'
    ? { title: 'Hackathonlar', subtitle: 'Yosh muhandislar uchun dasturlar', upcoming: 'Kutilayotgan', ongoing: 'Davom etmoqda', past: "O'tgan", view: "Ko'rish" }
    : { title: 'Hackathons', subtitle: 'Programs for young engineers', upcoming: 'Upcoming', ongoing: 'Ongoing', past: 'Past', view: 'View' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{label.title}</h1>
      <p className="text-muted-foreground mb-8">{label.subtitle}</p>

      {hackathons.length === 0 && <p className="text-muted-foreground">No hackathons yet.</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((hack) => (
          <Link
            key={hack.id}
            href={`/${locale}/hackathons/${hack.slug}`}
            className="block border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
          >
            {hack.coverImage && typeof hack.coverImage === 'object' && hack.coverImage.url && (
              <div className="aspect-video bg-muted">
                <img src={hack.coverImage.url} alt={hack.title || ''} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  hack.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                  hack.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {hack.status === 'upcoming' ? label.upcoming : hack.status === 'ongoing' ? label.ongoing : label.past}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-1">{hack.title}</h2>
              {hack.summary && <p className="text-sm text-muted-foreground line-clamp-2">{hack.summary}</p>}
              {hack.dateRange?.start && (
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(hack.dateRange.start).toLocaleDateString()}
                  {hack.dateRange.end && ` — ${new Date(hack.dateRange.end).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
