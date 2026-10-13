import { getCategories, getArticles } from '@/lib/supabase/queries'
import { EngineeringFlipHeadline } from '@/components/ui/engineering-flip-headline'
import { ArticlesBrowser } from './ArticlesBrowser'
import { categories } from '@/seed'

// A saved or newly due scheduled article appears without a rebuild.
export const dynamic = 'force-dynamic'

const enWords = categories.map(c => c.name.en === 'AI' ? 'AI' : c.name.en.split(' ')[0])
const uzWords = categories.map(c => c.name.uz)

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // ArticlesBrowser filters the current published list locally.
  const [cats, articles] = await Promise.all([
    getCategories(locale),
    getArticles(locale),
  ])

  const labels = {
    uz: { title: 'Maqolalar', all: 'Barchasi', noArticles: "Hozircha maqolalar yo'q" },
    en: { title: 'Articles', all: 'All', noArticles: 'No articles yet' },
    ru: { title: 'Статьи', all: 'Все', noArticles: 'Статей пока нет' },
  }

  const label = labels[locale as keyof typeof labels] || labels.uz

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
