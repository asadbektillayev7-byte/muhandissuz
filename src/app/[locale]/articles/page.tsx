import { getCategories, getArticles } from '@/lib/supabase/queries'
import { EngineeringFlipHeadline } from '@/components/ui/engineering-flip-headline'
import { ArticlesBrowser } from './ArticlesBrowser'
import { categories } from '@/seed'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

const enWords = categories.map(c => c.name.en === 'AI' ? 'AI' : c.name.en.split(' ')[0])
const uzWords = categories.map(c => c.name.uz)

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Everything is fetched once; ArticlesBrowser filters it in the browser, so
  // the category chips no longer cost a navigation and this route stays static.
  const [cats, articles] = await Promise.all([
    getCategories(locale),
    getArticles(locale),
  ])

  const labels = {
    uz: { title: 'Maqolalar', all: 'Barchasi', noArticles: "Hozircha maqolalar yo'q" },
    en: { title: 'Articles', all: 'All', noArticles: 'No articles yet' },
  }

  const label = locale === 'uz' ? labels.uz : labels.en

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <EngineeringFlipHeadline
        words={locale === 'uz' ? uzWords : enWords}
        suffixText={locale === 'uz' ? ' muhandisligi' : ' Engineering'}
        className="mb-8"
      />

      <ArticlesBrowser
        articles={articles}
        categories={cats}
        locale={locale}
        labels={{ all: label.all, noArticles: label.noArticles }}
      />
    </div>
  )
}
