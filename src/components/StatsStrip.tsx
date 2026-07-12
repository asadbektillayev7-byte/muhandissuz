import { getPayloadClient } from '@/utilities/getPayload'

export async function StatsStrip({ locale }: { locale: string }) {
  const payload = await getPayloadClient()

  const [articles, hackathons, projects, mentors] = await Promise.all([
    payload.find({ collection: 'articles', limit: 0, depth: 0 }),
    payload.find({ collection: 'hackathons', limit: 0, depth: 0 }),
    payload.find({ collection: 'student-projects', limit: 0, depth: 0 }),
    payload.find({ collection: 'mentors', limit: 0, depth: 0 }),
  ])

  const labels = locale === 'uz'
    ? [
        { label: 'Maqolalar', value: articles.totalDocs },
        { label: 'Hackathonlar', value: hackathons.totalDocs },
        { label: "O'quvchilar", value: projects.totalDocs },
        { label: 'Mentorlar', value: mentors.totalDocs },
      ]
    : [
        { label: 'Articles', value: articles.totalDocs },
        { label: 'Hackathons', value: hackathons.totalDocs },
        { label: 'Students', value: projects.totalDocs },
        { label: 'Mentors', value: mentors.totalDocs },
      ]

  return (
    <div className="border-y border-border py-6">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {labels.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-semibold font-sans" style={{ fontWeight: 600 }}>
              {stat.value}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5 tracking-wider uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
