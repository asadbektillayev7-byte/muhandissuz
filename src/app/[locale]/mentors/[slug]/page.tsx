import { getMentorBySlug } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import { notFound } from 'next/navigation'

export default async function MentorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const mentor = await getMentorBySlug(slug, locale)

  if (!mentor) notFound()

  const label = locale === 'uz'
    ? { contact: 'Aloqa', email: 'Email', telegram: 'Telegram' }
    : { contact: 'Contact', email: 'Email', telegram: 'Telegram' }

  const contact = typeof mentor.contact === 'string' ? JSON.parse(mentor.contact) : (mentor.contact || {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start gap-6 mb-8">
        {mentor.photo_url && (
          <img src={mentor.photo_url} alt={mentor.name} className="w-32 h-32 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
          {field(mentor, 'title', locale) && <p className="text-lg text-muted-foreground mb-2">{field(mentor, 'title', locale)}</p>}
        </div>
      </div>

      {field(mentor, 'bio', locale) && <p className="text-muted-foreground mb-6">{field(mentor, 'bio', locale)}</p>}

      {(contact.email || contact.telegram) && (
        <div className="border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
          <h2 className="font-semibold mb-2">{label.contact}</h2>
          {contact.email && <p className="text-sm">{label.email}: {contact.email}</p>}
          {contact.telegram && <p className="text-sm">{label.telegram}: {contact.telegram}</p>}
        </div>
      )}
    </div>
  )
}
