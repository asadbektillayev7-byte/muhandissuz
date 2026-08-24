import { createClient } from '@/lib/supabase/server'
import { getQuizzes, getQuizStats } from '@/lib/supabase/quiz-queries'
import { QuizBrowser } from '@/components/quiz/QuizBrowser'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const [quizzes, stats, { data: categories }, { data: links }, { data: articles }] =
    await Promise.all([
      getQuizzes(),
      getQuizStats(),
      supabase.from('categories').select('id, slug, name_uz, name_en').order('name_uz'),
      supabase.from('quiz_articles').select('quiz_id, article_id'),
      supabase.from('articles').select('id, title_uz, title_en'),
    ])

  // quiz -> articles, for Continue Learning's local-history matching.
  const quizArticleMap: Record<number, number[]> = {}
  for (const l of links ?? []) {
    ;(quizArticleMap[l.quiz_id] ??= []).push(l.article_id)
  }

  const articleTitles: Record<number, { uz: string; en: string | null }> = {}
  for (const a of articles ?? []) {
    articleTitles[a.id] = { uz: a.title_uz, en: a.title_en }
  }

  return (
    <QuizBrowser
      quizzes={quizzes}
      categories={categories ?? []}
      stats={stats}
      quizArticleMap={quizArticleMap}
      articleTitles={articleTitles}
      locale={locale}
    />
  )
}
