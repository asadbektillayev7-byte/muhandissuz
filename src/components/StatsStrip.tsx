import { getPayloadClient } from '@/utilities/getPayload'
import { AnimatedStatValue } from './AnimatedStatValue'

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
        { label: 'Hakatonlar', value: hackathons.totalDocs },
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
          <AnimatedStatValue key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  )
}
