// Public reads only — the cookie-free client keeps quiz pages cacheable.
import { createPublicClient } from './public'
import type { Quiz, QuizQuestion, QuizWithMeta } from '@/lib/quiz'

/** Embedded counts come back as [{ count: n }]; flatten them. */
function countOf(v: unknown): number {
  if (Array.isArray(v) && v.length > 0 && typeof (v[0] as any)?.count === 'number') {
    return (v[0] as any).count
  }
  return 0
}

const SELECT_WITH_META =
  '*, categories(id, slug, name_uz, name_en), quiz_questions(count), quiz_articles(count)'

function shape(row: any): QuizWithMeta {
  const { quiz_questions, quiz_articles, ...quiz } = row
  return {
    ...(quiz as Quiz),
    categories: row.categories ?? null,
    questionCount: countOf(quiz_questions),
    articleCount: countOf(quiz_articles),
  }
}

/** Every published quiz, newest first, with question and article counts. */
export async function getQuizzes(): Promise<QuizWithMeta[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('quizzes')
    .select(SELECT_WITH_META)
    .eq('published', true)
    // Hero takes results[0]: the featured quiz, else the newest.
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []).map(shape)
}

export async function getQuizBySlug(slug: string): Promise<QuizWithMeta | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('quizzes')
    .select(SELECT_WITH_META)
    .eq('slug', slug)
    .maybeSingle()
  return data ? shape(data) : null
}

export async function getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('sort_order')
  return (data ?? []) as QuizQuestion[]
}

/** Articles a quiz was written from, for "Based on X Muhandiss articles". */
export async function getQuizArticles(quizId: number) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('quiz_articles')
    .select('articles(id, slug, title_uz, title_en, cover_image_url)')
    .eq('quiz_id', quizId)
  return (data ?? []).map((r: any) => r.articles).filter(Boolean)
}

/** Real figures for the stats strip. No invented numbers. */
export async function getQuizStats() {
  const supabase = createPublicClient()
  const [quizzes, questions, links, fields] = await Promise.all([
    supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('quiz_questions').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_articles').select('article_id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ])
  return {
    quizzes: quizzes.count ?? 0,
    questions: questions.count ?? 0,
    articles: links.count ?? 0,
    fields: fields.count ?? 0,
  }
}

/** Quiz ids linked to the given articles — powers Continue Learning. */
export async function getQuizzesForArticles(articleIds: number[]): Promise<QuizWithMeta[]> {
  if (articleIds.length === 0) return []
  const supabase = createPublicClient()
  const { data: links } = await supabase
    .from('quiz_articles')
    .select('quiz_id')
    .in('article_id', articleIds)
  const ids = [...new Set((links ?? []).map((l: any) => l.quiz_id))]
  if (ids.length === 0) return []

  const { data } = await supabase
    .from('quizzes')
    .select(SELECT_WITH_META)
    .in('id', ids)
    .eq('published', true)
  return (data ?? []).map(shape)
}
