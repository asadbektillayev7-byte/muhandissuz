import Link from 'next/link'
import { getCategories } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'

export async function DisciplineIndex({ locale }: { locale: string }) {
  const categories = await getCategories(locale)

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-wrap gap-3">
        {categories.map((cat: any) => {
          return (
            <Link
              key={cat.id}
              href={`/${locale}/articles?category=${cat.slug}`}
              className="px-4 py-2 text-sm border border-border text-muted-foreground hover:border-chart-2 hover:text-chart-2 transition-colors"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {field(cat, 'name', locale)}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
