import { getTeamMembers } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const members = await getTeamMembers(locale)

  const label = locale === 'uz'
    ? { title: 'Jamoa', noMembers: 'Hozircha jamoa a\'zolari yo\'q' }
    : { title: 'Our Team', noMembers: 'No team members yet' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {members.length === 0 && <p className="text-muted-foreground">{label.noMembers}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member: any) => (
          <div key={member.id} className="border border-border p-6 text-center" style={{ borderRadius: 'var(--radius)' }}>
            {member.photo_url && (
              <img src={member.photo_url} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
            )}
            <h2 className="font-semibold text-lg">{member.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{field(member, 'role', locale)}</p>
            {field(member, 'bio', locale) && <p className="text-sm text-muted-foreground">{field(member, 'bio', locale)}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
