import { getPayloadClient } from '@/utilities/getPayload'
import { resolveLocalizedField } from '@/lib/locale'
import Link from 'next/link'

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  const payload = await getPayloadClient()

  const { docs: categories } = await payload.find({
    collection: 'categories',
    locale: locale as 'uz' | 'en',
    sort: 'name',
  })

  const { docs: articles } = category
    ? await payload.find({
        collection: 'articles',
        locale: locale as 'uz' | 'en',
        depth: 2,
        sort: '-publishedDate',
        where: { 'category.slug': { equals: category } } as any,
      })
    : await payload.find({
        collection: 'articles',
        locale: locale as 'uz' | 'en',
        depth: 2,
        sort: '-publishedDate',
      })

  const labels = {
    uz: { title: 'Maqolalar', all: 'Barchasi', readMore: "O'qish", noArticles: "Hozircha maqolalar yo'q" },
    en: { title: 'Articles', all: 'All', readMore: 'Read more', noArticles: 'No articles yet' },
  }

  const label = locale === 'uz' ? labels.uz : labels.en

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{label.title}</h1>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/${locale}/articles`}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              !category ? 'border-chart-2 text-chart-2 bg-muted' : 'bg-muted hover:bg-muted'
            }`}
          >
            {label.all}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/articles?category=${cat.slug}`}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                category === cat.slug ? 'border-chart-2 text-chart-2 bg-muted' : 'bg-muted hover:bg-muted'
              }`}
            >
              {resolveLocalizedField(cat.name, locale)}
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 && (
        <p className="text-muted-foreground">{label.noArticles}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${locale}/articles/${article.slug}`}
            className="block border border-border overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: 'var(--radius)' }}
          >
            {article.coverImage && typeof article.coverImage === 'object' && article.coverImage.url && (
                <div className="aspect-video bg-muted">
                <img
                  src={article.coverImage.url}
                  alt={article.title || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
              {article.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{article.author && typeof article.author === 'object' ? article.author.name : ''}</span>
                <span>{label.readMore} &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
