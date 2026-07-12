import { getPayloadClient } from '@/utilities/getPayload'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayloadClient()

  const { docs: members } = await payload.find({
    collection: 'team-members',
    locale: locale as 'uz' | 'en',
  })

  const label = locale === 'uz'
    ? { title: 'Jamoa', noMembers: 'Hozircha jamoa a\'zolari yo\'q' }
    : { title: 'Our Team', noMembers: 'No team members yet' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {members.length === 0 && <p className="text-muted-foreground">{label.noMembers}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            {member.photo && typeof member.photo === 'object' && member.photo.url && (
              <img src={member.photo.url} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
            )}
            <h2 className="font-semibold text-lg">{member.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
            {member.bio && <p className="text-sm text-muted-foreground">{member.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
