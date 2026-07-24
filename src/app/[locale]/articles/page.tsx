import { getCategories, getArticles } from '@/lib/supabase/queries'
import { field } from '@/lib/supabase/locale'
import Link from 'next/link'
import { EngineeringFlipHeadline } from '@/components/ui/engineering-flip-headline'
import { ArticleCard } from './ArticleCard'
import { categories } from '@/seed'

const enWords = categories.map(c => c.name.en === 'AI' ? 'AI' : c.name.en.split(' ')[0])
const uzWords = categories.map(c => c.name.uz)

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams

  const cats = await getCategories(locale)
  const articles = category
    ? await getArticles(locale, category)
    : await getArticles(locale)

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

      {cats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/${locale}/articles`}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              !category ? 'border-chart-2 text-chart-2 bg-muted' : 'bg-muted hover:bg-muted'
            }`}
          >
            {label.all}
          </Link>
          {cats.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/${locale}/articles?category=${cat.slug}`}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                category === cat.slug ? 'border-chart-2 text-chart-2 bg-muted' : 'bg-muted hover:bg-muted'
              }`}
            >
              {field(cat, 'name', locale)}
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 && (
        <p className="text-muted-foreground">{label.noArticles}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article: any) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </div>
  )
}
