import { getArticleBySlug } from '@/lib/supabase/queries'
import { localizedArticle } from '@/lib/article-content'
import { ArticleView } from '@/components/ArticleView'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Newly published and newly due scheduled articles must be visible immediately.
// The query is anonymous; drafts are available only through the admin preview.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params:Promise<{ locale:string; slug:string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug, locale)
  if (!article) return {}
  const content = localizedArticle(article, locale)
  const image = article.og_image_url || article.cover_image_url || undefined
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://muhandiss.uz'
  const url = `${base}/${locale}/articles/${encodeURIComponent(article.slug)}`
  const description = content.metaDescription || content.excerpt
  return {
    title:content.title, description,
    alternates:{ canonical:url, languages:Object.fromEntries(['uz','en','ru'].map(language => [language, `${base}/${language}/articles/${encodeURIComponent(article.slug)}`])) },
    openGraph:{ title:content.title, description, url, siteName:'Muhandiss.uz', locale:locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US', type:'article', ...(image ? { images:[{ url:image }] } : {}) },
    twitter:{ card:'summary_large_image', title:content.title, description, ...(image ? { images:[image] } : {}) },
  }
}

export default async function ArticlePage({ params }: { params:Promise<{ locale:string; slug:string }> }) {
  const { locale, slug } = await params
  const article = await getArticleBySlug(slug, locale)
  if (!article) notFound()
  return <ArticleView article={article} locale={locale} />
}
