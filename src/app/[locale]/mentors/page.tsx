import { getMentors } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import Link from 'next/link'

export default async function MentorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const mentors = await getMentors(locale)

  const label = locale === 'uz'
    ? { title: 'Mentorlar', noMentors: 'Hozircha mentorlar yo\'q' }
    : { title: 'Mentors', noMentors: 'No mentors yet' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {mentors.length === 0 && <p className="text-muted-foreground">{label.noMentors}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor: any) => (
          <Link
            key={mentor.id}
            href={`/${locale}/mentors/${mentor.slug}`}
            className="flex items-center gap-4 border border-border p-4 hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
          >
            {mentor.photo_url && (
              <img src={mentor.photo_url} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
            )}
            <div>
              <h2 className="font-semibold">{mentor.name}</h2>
              {field(mentor, 'title', locale) && <p className="text-sm text-muted-foreground">{field(mentor, 'title', locale)}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
