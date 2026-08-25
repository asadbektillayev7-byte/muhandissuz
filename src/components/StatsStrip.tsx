import { getStats } from '@/lib/supabase/queries'
import { AnimatedStatValue } from './AnimatedStatValue'

/**
 * Slim two-counter strip. A zero counter is hidden rather than advertised,
 * and the strip disappears entirely if nothing has a value yet.
 */
export async function StatsStrip({ locale }: { locale: string }) {
  const stats = await getStats()

  const items = (
    locale === 'uz'
      ? [
          { label: 'Maqolalar', value: stats.articles },
          { label: 'Hakatonlar', value: stats.hackathons },
        ]
      : [
          { label: 'Articles', value: stats.articles },
          { label: 'Hackathons', value: stats.hackathons },
        ]
  ).filter((s) => s.value > 0)

  if (items.length === 0) return null

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
