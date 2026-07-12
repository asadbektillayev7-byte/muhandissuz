import Link from 'next/link'
import { getPayloadClient } from '@/utilities/getPayload'
import { renderRichText } from '@/utilities/richText'
import { notFound } from 'next/navigation'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    locale: locale as 'uz' | 'en',
    depth: 2,
  })

  if (docs.length === 0) notFound()

  const article = docs[0]

  const labels = {
    uz: { author: 'Muallif', translator: 'Tarjimon', published: "Chop etilgan", category: 'Kategoriya' },
    en: { author: 'Author', translator: 'Translator', published: 'Published', category: 'Category' },
  }

  const label = locale === 'uz' ? labels.uz : labels.en

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {article.coverImage && typeof article.coverImage === 'object' && article.coverImage.url && (
        <div className="aspect-video overflow-hidden mb-8 bg-muted" style={{ borderRadius: 'var(--radius)' }}>
          <img src={article.coverImage.url} alt={article.title || ''} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
        {article.author && typeof article.author === 'object' && (
          <span>{label.author}: {article.author.name}</span>
        )}
        {article.translator && typeof article.translator === 'object' && (
          <span>{label.translator}: {article.translator.name}</span>
        )}
        {article.publishedDate && (
          <span>{label.published}: {new Date(article.publishedDate).toLocaleDateString()}</span>
        )}
        {article.category && typeof article.category === 'object' && (
          <span>{label.category}: {article.category.name}</span>
        )}
        {article.relatedHackathon && typeof article.relatedHackathon === 'object' && (
          <Link href={`/${locale}/hackathons/${article.relatedHackathon.slug}`} className="text-chart-2 hover:underline">
            {article.relatedHackathon.title}
          </Link>
        )}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag: any, i: number) => (
            <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{tag?.tag}</span>
          ))}
        </div>
      )}

      <div className="prose max-w-none">
        {renderRichText(article.body as any)}
      </div>
    </article>
  )
}
