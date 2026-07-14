import Link from 'next/link'
import { getPayloadClient } from '@/utilities/getPayload'
import { resolveLocalizedField } from '@/lib/locale'

export async function DisciplineIndex({ locale }: { locale: string }) {
  const payload = await getPayloadClient()

  const { docs: categories } = await payload.find({
    collection: 'categories',
    locale: locale as 'uz' | 'en',
    sort: 'name',
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isFeatured = cat.featured
          return (
            <Link
              key={cat.id}
              href={`/${locale}/articles?category=${cat.slug}`}
              className={`
                px-4 py-2 text-sm border transition-colors
                ${isFeatured
                  ? 'border-chart-2 text-chart-2 font-medium'
                  : 'border-border text-muted-foreground hover:border-chart-2 hover:text-chart-2'
                }
              `}
              style={{ borderRadius: 'var(--radius)' }}
            >
              {resolveLocalizedField(cat.name, locale)}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
