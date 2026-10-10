import Link from 'next/link'
import { getArticleBySlug, getArticles } from '@/lib/supabase/queries'
import { field, localizedBody } from '@/lib/supabase/locale'
import { renderRichText } from '@/utilities/richText'
import { resolveLocalizedField } from '@/lib/locale'
import { notFound } from 'next/navigation'
import { TrackArticleRead } from '@/components/quiz/TrackArticleRead'
import type { Metadata } from 'next'

// Public content: served from cache and rebuilt in the background, so a
// navigation does not wait on a server render plus a database round-trip.
// Next only accepts a literal here, so the shared PUBLIC_REVALIDATE in
// lib/supabase/public.ts documents the value rather than supplying it.
export const revalidate = 600

/**
 * Prerender every article at build time so the first visitor to a page does
 * not pay a cold server render. New articles published later are still served
 * on demand and then cached by the revalidate above.
 */
export async function generateStaticParams() {
  const articles = await getArticles('uz')
  return (articles ?? []).flatMap((a: { slug: string }) => [
    { locale: 'uz', slug: a.slug },
    { locale: 'en', slug: a.slug },
  ])
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug, locale)

  if (!article) return {}

  const title = field(article, 'title', locale)
  const description =
    field(article, 'meta_description', locale) ||
    field(article, 'excerpt', locale) ||
    ''
  const ogImageUrl = article.og_image_url || article.cover_image_url || undefined

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'
  const url = `${baseUrl}/${locale}/articles/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Muhandiss.uz',
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
      type: 'article',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug, locale)

  if (!article) notFound()

  const labels = {
    uz: {
      author: 'Muallif',
      category: 'Kategoriya',
      published: 'Chop etilgan',
      leader: "Bo'lim rahbari",
      editor: 'Muharrir',
      translator: 'Tarjimon',
      researcher: 'Tadqiqotchi',
    },
    en: {
      author: 'Author',
      category: 'Category',
      published: 'Published',
      leader: 'Leader',
      editor: 'Editor',
      translator: 'Translator',
      researcher: 'Researcher',
    },
  }

  const label = locale === 'uz' ? labels.uz : labels.en

  const credits = [
    { label: label.leader, value: article.department_leader?.trim() },
    { label: label.editor, value: article.editor?.trim() },
    { label: label.translator, value: article.translator?.trim() },
    { label: label.researcher, value: article.researcher?.trim() },
  ].filter((c) => Boolean(c.value))

  const body = localizedBody(article, 'body', locale)

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <TrackArticleRead articleId={article.id} categoryId={article.category_id ?? null} />

      {article.cover_image_url && (
        <div className="aspect-video overflow-hidden mb-8 bg-muted" style={{ borderRadius: 'var(--radius)' }}>
          <img src={article.cover_image_url} alt={field(article, 'title', locale)} className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{field(article, 'title', locale)}</h1>

      <div className="space-y-1 mb-8">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {article.authors?.name && (
            <span>{label.author}: <span className="text-foreground">{article.authors.name}</span></span>
          )}
          {article.categories && (
            <span>{label.category}: {field(article.categories, 'name', locale)}</span>
          )}
          {article.published_date && (
            <span>{label.published}: {new Date(article.published_date).toLocaleDateString()}</span>
          )}
        </div>

        {credits.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {credits.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span>{c.label}:</span>
                <span className="text-foreground/90 font-medium">{c.value}</span>
                {i < credits.length - 1 && <span className="text-muted-foreground/40 ml-2">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag: string, i: number) => (
            <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <div className="prose max-w-none">
        {renderRichText(body as any)}
      </div>
    </article>
  )
}
