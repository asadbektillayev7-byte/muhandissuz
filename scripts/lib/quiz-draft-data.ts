import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export type ArticleQuizDraft = {
  article_id: number
  article_slug: string
  source_title: string
  source_sha256: string
  slug: string
  category_slug: string
  title_uz: string
  title_en: string
  description_uz: string
  description_en: string
  duration_minutes: number
  questions: Array<{
    question_uz: string
    question_en: string
    options_uz: string[]
    options_en: string[]
    correct_index: number
    explanation_uz: string
    explanation_en: string
    evidence: { quote: string; learning_objective: string }
  }>
}

export type QuizSource = {
  id: number; slug: string; title_uz: string; plain_uz: string
  published: boolean; published_date: string; categories: { slug: string } | null
}

export const sourceHash = (text: string) => createHash('sha256').update(text).digest('hex')

export async function readQuizDraftBatch(): Promise<ArticleQuizDraft[]> {
  const groups = await Promise.all(['motorsport', 'environment', 'science'].map(async name =>
    JSON.parse(await readFile(new URL(`../../content/quiz-drafts/${name}.json`, import.meta.url), 'utf8'))
  ))
  return groups.flat().sort((a, b) => a.article_id - b.article_id)
}

/** Reject the entire batch before writing anything. Source checks use full text. */
export function validateQuizDraftBatch(drafts: ArticleQuizDraft[], sources?: QuizSource[], now = Date.now()) {
  if (!Array.isArray(drafts) || drafts.length === 0) throw new Error('No quiz drafts supplied.')
  const slugs = new Set<string>(), articleIds = new Set<number>(), prompts = new Set<string>()
  const present = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
  for (const quiz of drafts) {
    const fail = (message: string): never => { throw new Error(`${quiz.slug || 'Quiz'}: ${message}`) }
    if (!Number.isSafeInteger(quiz.article_id) || quiz.article_id < 1 || articleIds.has(quiz.article_id)) fail('invalid or duplicate article')
    if (!/^maqola-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(quiz.slug) || slugs.has(quiz.slug)) fail('invalid or duplicate slug')
    if ('published' in quiz || 'difficulty' in quiz) fail('publication and difficulty cannot be supplied in draft data')
    articleIds.add(quiz.article_id); slugs.add(quiz.slug)
    for (const key of ['article_slug', 'source_title', 'category_slug', 'title_uz', 'title_en', 'description_uz', 'description_en'] as const) {
      if (!present(quiz[key])) fail(`missing ${key}`)
    }
    if (!/^[a-f0-9]{64}$/.test(quiz.source_sha256)) fail('missing source hash')
    if (!Number.isInteger(quiz.duration_minutes) || quiz.duration_minutes < 1) fail('invalid duration')
    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 4) fail('this batch requires four questions per article')
    const positions = new Set<number>()
    for (const q of quiz.questions) {
      for (const key of ['question_uz', 'question_en', 'explanation_uz', 'explanation_en'] as const) {
        if (!present(q[key])) fail(`missing ${key}`)
      }
      const normalized = q.question_uz.trim().toLocaleLowerCase()
      if (prompts.has(normalized)) fail('duplicate question')
      prompts.add(normalized)
      for (const options of [q.options_uz, q.options_en]) {
        if (!Array.isArray(options) || options.length !== 4 || !options.every(present) ||
          new Set(options.map(o => o.trim().toLocaleLowerCase())).size !== 4) fail('four distinct nonempty choices required in both languages')
      }
      if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) fail('invalid answer index')
      positions.add(q.correct_index)
      if (!present(q.evidence?.quote) || !present(q.evidence?.learning_objective)) fail('missing answer evidence')
    }
    if (positions.size !== 4) fail('answer positions must be balanced within this four-question batch')
    if (sources) {
      const source = sources.find(a => a.id === quiz.article_id)
      if (!source || !source.published || !Number.isFinite(Date.parse(source.published_date)) || Date.parse(source.published_date) > now) fail('source is no longer publicly published')
      if (source!.slug !== quiz.article_slug || source!.title_uz !== quiz.source_title || source!.categories?.slug !== quiz.category_slug) fail('source metadata changed; review again')
      if (sourceHash(source!.plain_uz) !== quiz.source_sha256) fail('source body changed; review again')
      for (const q of quiz.questions) if (!source!.plain_uz.includes(q.evidence.quote)) fail('answer evidence is not in the source')
    }
  }
  if (sources) {
    const missing = sources.filter(a => a.published && Date.parse(a.published_date) <= now && a.plain_uz.trim() && !articleIds.has(a.id))
    if (missing.length) throw new Error(`Published articles need new drafts: ${missing.map(a => a.id).join(', ')}`)
  }
  return { quizzes: drafts.length, questions: drafts.reduce((sum, q) => sum + q.questions.length, 0) }
}

export function questionRows(quiz: ArticleQuizDraft, quizId: number) {
  // Explicit columns prevent editorial evidence or unexpected JSON properties
  // from becoming database writes. IDs and order always come from the importer.
  return quiz.questions.map((q, sort_order) => ({
    quiz_id: quizId,
    question_uz: q.question_uz,
    question_en: q.question_en,
    options_uz: q.options_uz,
    options_en: q.options_en,
    correct_index: q.correct_index,
    explanation_uz: q.explanation_uz,
    explanation_en: q.explanation_en,
    sort_order,
  }))
}
