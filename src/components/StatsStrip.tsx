import { getStats } from '@/lib/supabase/queries'
import { AnimatedStatValue } from './AnimatedStatValue'

/**
 * Slim counter strip. Zeros are shown deliberately — the counts fill in as
 * hackathons and projects are added through the admin panel.
 */
export async function StatsStrip({ locale }: { locale: string }) {
  const stats = await getStats()

  const items = (
    locale === 'uz'
      ? [
          { label: 'Maqolalar', value: stats.articles },
          { label: 'Hakatonlar', value: stats.hackathons },
          { label: 'Loyihalar', value: stats.projects },
        ]
      : [
          { label: 'Articles', value: stats.articles },
          { label: 'Hackathons', value: stats.hackathons },
          { label: 'Projects', value: stats.projects },
        ]
  )

  return (
    <div className="border-y" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-16 gap-y-4 px-4 py-5">
        {items.map((stat) => (
          <AnimatedStatValue key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  )
}
