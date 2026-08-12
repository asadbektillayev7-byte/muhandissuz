import { getStats } from '@/lib/supabase/queries'
import { AnimatedStatValue } from './AnimatedStatValue'

export async function StatsStrip({ locale }: { locale: string }) {
  const stats = await getStats()

  const labels = locale === 'uz'
    ? [
        { label: 'Maqolalar', value: stats.articles },
        { label: 'Hakatonlar', value: stats.hackathons },
      ]
    : [
        { label: 'Articles', value: stats.articles },
        { label: 'Hackathons', value: stats.hackathons },
      ]

  return (
    <div className="border-y border-border py-6">
      <div className="max-w-lg mx-auto px-4 grid grid-cols-2 gap-6">
        {labels.map((stat) => (
          <AnimatedStatValue key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  )
}
