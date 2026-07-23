import { getHackathons } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import Link from 'next/link'

export default async function HackathonsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const hackathons = await getHackathons(locale)

  const label = locale === 'uz'
    ? { title: 'Hakatonlar', subtitle: 'Yosh muhandislar uchun dasturlar', upcoming: 'Kutilayotgan', ongoing: 'Davom etmoqda', past: "O'tgan", view: "Ko'rish" }
    : { title: 'Hackathons', subtitle: 'Programs for young engineers', upcoming: 'Upcoming', ongoing: 'Ongoing', past: 'Past', view: 'View' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{label.title}</h1>
      <p className="text-muted-foreground mb-8">{label.subtitle}</p>

      {hackathons.length === 0 && <p className="text-muted-foreground">No hackathons yet.</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((hack: any) => (
          <Link
            key={hack.id}
            href={`/${locale}/hackathons/${hack.slug}`}
            className="block border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
          >
            {hack.cover_image_url && (
              <div className="aspect-video bg-muted">
                <img src={hack.cover_image_url} alt={field(hack, 'title', locale)} className="w-full h-full object-cover" />
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
              <h2 className="text-lg font-semibold mb-1">{field(hack, 'title', locale)}</h2>
              {field(hack, 'summary', locale) && <p className="text-sm text-muted-foreground line-clamp-2">{field(hack, 'summary', locale)}</p>}
              {hack.date_range_start && (
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(hack.date_range_start).toLocaleDateString()}
                  {hack.date_range_end && ` — ${new Date(hack.date_range_end).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
