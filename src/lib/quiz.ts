export type LanguageMode = 'bilingual' | 'en' | 'uz'

export type QuizCategory = {
  id: number
  slug: string
  name_uz: string
  name_en: string
}

export type Quiz = {
  id: number
  slug: string
  category_id: number | null
  title_uz: string
  title_en: string | null
  description_uz: string | null
  description_en: string | null
  duration_minutes: number | null
  thumbnail_url: string | null
  language_mode: LanguageMode
  published: boolean
  featured: boolean
  created_at: string
}

/** A quiz plus the counts the cards display. */
export type QuizWithMeta = Quiz & {
  categories: QuizCategory | null
  questionCount: number
  articleCount: number
}

export type QuizQuestion = {
  id: number
  quiz_id: number
  question_uz: string
  question_en: string | null
  image_url: string | null
  options_uz: string[]
  options_en: string[]
  correct_index: number
  explanation_uz: string | null
  explanation_en: string | null
  sort_order: number
}

/** Falls back to ~30s per question when an author leaves duration blank. */
export function effectiveDuration(quiz: { duration_minutes: number | null }, questionCount: number) {
  if (quiz.duration_minutes && quiz.duration_minutes > 0) return quiz.duration_minutes
  return Math.max(1, Math.round((questionCount * 30) / 60))
}

/** localStorage key for the Continue Learning recommendations. */
export const READ_ARTICLES_KEY = 'muhandiss:read-articles'

export type ReadArticle = { id: number; categoryId: number | null; at: number }

export function readArticleHistory(): ReadArticle[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(READ_ARTICLES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function recordArticleRead(id: number, categoryId: number | null) {
  if (typeof window === 'undefined') return
  try {
    const history = readArticleHistory().filter((r) => r.id !== id)
    history.unshift({ id, categoryId, at: Date.now() })
    window.localStorage.setItem(READ_ARTICLES_KEY, JSON.stringify(history.slice(0, 20)))
  } catch {
    // storage disabled — Continue Learning just stays empty
  }
}
