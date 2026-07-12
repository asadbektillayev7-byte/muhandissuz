import { getPayloadClient } from '@/utilities/getPayload'
import { notFound } from 'next/navigation'

export default async function MentorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'mentors',
    where: { slug: { equals: slug } },
    locale: locale as 'uz' | 'en',
    depth: 2,
  })

  if (docs.length === 0) notFound()

  const mentor = docs[0]

  const label = locale === 'uz'
    ? { disciplines: 'Fan yo\'nalishlari', contact: 'Aloqa', email: 'Email', telegram: 'Telegram' }
    : { disciplines: 'Disciplines', contact: 'Contact', email: 'Email', telegram: 'Telegram' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start gap-6 mb-8">
        {mentor.photo && typeof mentor.photo === 'object' && mentor.photo.url && (
          <img src={mentor.photo.url} alt={mentor.name} className="w-32 h-32 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-1">{mentor.name}</h1>
          {mentor.title && <p className="text-lg text-muted-foreground mb-2">{mentor.title}</p>}
        </div>
      </div>

      {mentor.disciplines && mentor.disciplines.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">{label.disciplines}</h2>
          <div className="flex flex-wrap gap-2">
            {mentor.disciplines.map((d: any) => (
              <span key={d.id} className="px-3 py-1 text-sm bg-muted rounded-full">{d.name}</span>
            ))}
          </div>
        </div>
      )}

      {mentor.bio && <p className="text-muted-foreground mb-6">{mentor.bio}</p>}

      {mentor.contact && (mentor.contact.email || mentor.contact.telegram) && (
        <div className="border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
          <h2 className="font-semibold mb-2">{label.contact}</h2>
          {mentor.contact.email && <p className="text-sm">{label.email}: {mentor.contact.email}</p>}
          {mentor.contact.telegram && <p className="text-sm">{label.telegram}: {mentor.contact.telegram}</p>}
        </div>
      )}
    </div>
  )
}
