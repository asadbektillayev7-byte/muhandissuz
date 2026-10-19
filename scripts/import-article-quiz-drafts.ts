/** Read-only unless --apply is passed. Never publishes or replaces a quiz. */
import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import { richTextToPlain } from '../src/lib/quizGeneration'
import { readQuizDraftBatch, validateQuizDraftBatch, questionRows, type ArticleQuizDraft } from './lib/quiz-draft-data'
import { createQuizImportFetch } from './lib/quiz-import-fetch'

config({ path: '.env.local', quiet: true }); config({ path: '.env', quiet: true })
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !anonKey || !serviceKey) throw new Error('Existing Supabase environment variables are required.')

class ImportFailure extends Error {}

/** Log actionable transport/database details without credentials or raw payloads. */
function failure(stage: string, problem: unknown, status?: number): ImportFailure {
  const details = problem && typeof problem === 'object' ? problem as { message?: unknown; code?: unknown } : {}
  function redact(value: string) {
    for (const key of [anonKey!, serviceKey!]) {
      value = value.split(key).join('[redacted]').split(encodeURIComponent(key)).join('[redacted]')
    }
    return value.replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
  }
  const message = redact(typeof details.message === 'string' ? details.message : typeof problem === 'string' ? problem : 'Unknown error').slice(0, 1000)
  const code = typeof details.code === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(details.code) ? redact(details.code) : undefined
  const context = [code ? `code=${code}` : '', typeof status === 'number' && Number.isFinite(status) ? `status=${status}` : ''].filter(Boolean).join(', ')
  return new ImportFailure(`${stage}${context ? ` [${context}]` : ''}: ${message}`)
}

function primaryAndCleanup(primary: ImportFailure, cleanup: ImportFailure, context: string) {
  return new AggregateError([primary, cleanup], `${context}\nPrimary failure: ${primary.message}\nCleanup failure: ${cleanup.message}`)
}

const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: createQuizImportFetch() } }
const admin = createClient(url, serviceKey, options), anon = createClient(url, anonKey, options)
const apply = process.argv.includes('--apply')
if (process.argv.slice(2).some(arg => arg !== '--apply')) throw new Error('Only --apply is supported; omit it for read-only validation.')

const drafts = await readQuizDraftBatch()
const { data: articles, error: articleError, count } = await admin.from('articles')
  .select('id,slug,title_uz,body_uz,published,published_date,category_id,categories(slug)', { count: 'exact' })
  .eq('published', true).lte('published_date', new Date().toISOString()).order('id').range(0, 999)
if (articleError) throw articleError
if (count !== articles?.length) throw new Error('Article read was truncated; paginate before importing.')
const sources = articles!.map(a => ({ ...a, categories: a.categories as unknown as { slug: string } | null, plain_uz: richTextToPlain(a.body_uz) }))
console.log(validateQuizDraftBatch(drafts, sources))

function metadata(draft: ArticleQuizDraft) {
  return {
    slug: draft.slug, title_uz: draft.title_uz, title_en: draft.title_en,
    description_uz: draft.description_uz, description_en: draft.description_en,
    category_id: sources.find(a => a.id === draft.article_id)!.category_id,
    duration_minutes: draft.duration_minutes, language_mode: 'bilingual',
    published: false, featured: false,
  }
}

async function verifySaved(draft: ArticleQuizDraft, row: Record<string, any>) {
  for (const [key, value] of Object.entries(metadata(draft))) {
    if (row[key] !== value) throw new Error(`${draft.slug}: existing metadata differs; refusing to overwrite.`)
  }
  const [questions, links] = await Promise.all([
    admin.from('quiz_questions').select('*').eq('quiz_id', row.id).order('sort_order'),
    admin.from('quiz_articles').select('article_id').eq('quiz_id', row.id),
  ])
  if (questions.error || links.error) throw questions.error || links.error
  const expected = questionRows(draft, row.id)
  assert.deepEqual(questions.data!.map(q => Object.fromEntries(Object.keys(expected[0]).map(key => [key, q[key]]))), expected, `${draft.slug}: questions differ; refusing to overwrite.`)
  assert.deepEqual(links.data, [{ article_id: draft.article_id }], `${draft.slug}: source links differ.`)
}

const { data: existing, error: existingError } = await admin.from('quizzes').select('*').in('slug', drafts.map(q => q.slug))
if (existingError) throw existingError
for (const row of existing!) await verifySaved(drafts.find(d => d.slug === row.slug)!, row)
console.log({ verifiedExistingDrafts: existing!.length, draftsRemaining: drafts.length - existing!.length })

const { data: publishedBefore, error: beforeError } = await admin.from('quizzes')
  .select('*,quiz_questions(*),quiz_articles(*)').eq('published', true).order('id')
if (beforeError) throw beforeError

if (!apply) {
  console.log({ mode: 'read-only', toCreate: drafts.length - existing!.length, alreadySaved: existing!.length, emptyArticleBodies: sources.filter(a => !a.plain_uz).map(a => a.id) })
  process.exit(0)
}

// A disposable, content-free fixture verifies actual anonymous permissions,
// including child tables. No real draft text is written before this passes.
const probeSlug = `quiz-privacy-check-${randomUUID()}`
let probeFailure: ImportFailure | undefined
let probeCleanupFailure: ImportFailure | undefined
let probeStage = 'Creating privacy fixture'
try {
  const creation = await admin.from('quizzes').insert({ slug: probeSlug, title_uz: 'Privacy check', published: false }).select('id').single()
  if (creation.error) throw failure(probeStage, creation.error, creation.status)
  const probe = creation.data
  if (!probe) throw failure(probeStage, 'No inserted record was returned; the write outcome is unknown.')
  probeStage = 'Creating privacy fixture question'
  const question = await admin.from('quiz_questions').insert({ quiz_id: probe.id, question_uz: 'Privacy check', options_uz: ['A', 'B'], correct_index: 0 })
  if (question.error) throw failure(probeStage, question.error, question.status)
  probeStage = 'Creating privacy fixture source link'
  const link = await admin.from('quiz_articles').insert({ quiz_id: probe.id, article_id: drafts[0].article_id })
  if (link.error) throw failure(probeStage, link.error, link.status)
  probeStage = 'Reading privacy fixture anonymously'
  const reads = await Promise.all([
    anon.from('quizzes').select('id').eq('id', probe.id),
    anon.from('quiz_questions').select('id').eq('quiz_id', probe.id),
    anon.from('quiz_articles').select('quiz_id').eq('quiz_id', probe.id),
  ])
  for (const [index, response] of reads.entries()) {
    const stage = `Anonymous privacy read: ${['quizzes', 'quiz_questions', 'quiz_articles'][index]}`
    if (response.error) throw failure(stage, response.error, response.status)
    if (!response.data) throw failure(stage, 'No data returned; privacy could not be verified.')
    if (response.data.length) throw failure(stage, 'Draft privacy check failed. Apply migration_v14.sql before importing.')
  }
  console.log('Anonymous draft privacy check passed for quiz, questions and article links.')
} catch (error) {
  probeFailure = error instanceof ImportFailure ? error : failure(probeStage, error)
} finally {
  // Use the unique slug even if creation returned no ID: the write may have
  // committed before a network failure. Cleanup runs once, without retrying.
  try {
    const cleanup = await admin.from('quizzes').delete().eq('slug', probeSlug).eq('published', false)
    if (cleanup.error) throw failure(`Privacy fixture cleanup (${probeSlug})`, cleanup.error, cleanup.status)
  } catch (error) {
    probeCleanupFailure = error instanceof ImportFailure ? error : failure(`Privacy fixture cleanup (${probeSlug})`, error)
  }
}
if (probeFailure && probeCleanupFailure) throw primaryAndCleanup(probeFailure, probeCleanupFailure, `Privacy check failed and fixture cleanup needs manual review: ${probeSlug}`)
if (probeFailure) throw probeFailure
if (probeCleanupFailure) throw probeCleanupFailure

const receipt: Array<{ id: number; slug: string; article_id: number; published: false; questions: number }> = []
for (const draft of drafts) {
  let saved = existing!.find(q => q.slug === draft.slug)
  const alreadySaved = Boolean(saved)
  if (!saved) {
    const { data, error } = await admin.from('quizzes').insert(metadata(draft)).select('*').single()
    if (error) throw error
    saved = data
    try {
      const questions = await admin.from('quiz_questions').insert(questionRows(draft, saved!.id))
      if (questions.error) throw questions.error
      const link = await admin.from('quiz_articles').insert({ quiz_id: saved!.id, article_id: draft.article_id })
      if (link.error) throw link.error
      await verifySaved(draft, saved!)
    } catch (error) {
      // Only roll back the quiz this invocation just created, never older work.
      const primary = error instanceof ImportFailure ? error : failure(`${draft.slug}: saving questions and source link`, error)
      try {
        const cleanup = await admin.from('quizzes').delete().eq('id', saved!.id).eq('slug', draft.slug).eq('published', false)
        if (cleanup.error) throw failure(`${draft.slug}: rollback`, cleanup.error, cleanup.status)
      } catch (cleanupError) {
        const cleanup = cleanupError instanceof ImportFailure ? cleanupError : failure(`${draft.slug}: rollback`, cleanupError)
        throw primaryAndCleanup(primary, cleanup, `${draft.slug}: import failed and rollback needs manual review.`)
      }
      throw primary
    }
  }
  receipt.push({ id: saved!.id, slug: draft.slug, article_id: draft.article_id, published: false, questions: draft.questions.length })
  console.log({ progress: `${receipt.length}/${drafts.length}`, articleId: draft.article_id, slug: draft.slug, status: alreadySaved ? 'verified existing draft' : 'saved draft', questions: draft.questions.length })
}

const ids = receipt.map(q => q.id)
const publicReads = await Promise.all([
  anon.from('quizzes').select('id').in('id', ids),
  anon.from('quiz_questions').select('id').in('quiz_id', ids),
  anon.from('quiz_articles').select('quiz_id').in('quiz_id', ids),
])
if (publicReads.some(r => r.error || !r.data || r.data.length)) throw new Error('Post-import privacy verification failed; inspect quiz policies.')
const { data: publishedAfter, error: afterError } = await admin.from('quizzes')
  .select('*,quiz_questions(*),quiz_articles(*)').eq('published', true).order('id')
if (afterError) throw afterError
// Sort nested relations before comparing; PostgREST does not promise their order.
const canonical = (rows: any[]) => rows.map(q => ({ ...q, quiz_questions: [...q.quiz_questions].sort((a,b) => a.id-b.id), quiz_articles: [...q.quiz_articles].sort((a,b) => a.article_id-b.article_id) }))
assert.deepEqual(canonical(publishedAfter!), canonical(publishedBefore!), 'Existing published quizzes changed during import.')
await writeFile(new URL('../content/quiz-drafts/import-receipt.json', import.meta.url), JSON.stringify({ imported_at: new Date().toISOString(), drafts: receipt }, null, 2) + '\n')
console.log({ savedDrafts: receipt.length, questions: receipt.reduce((sum,q) => sum+q.questions,0), publicDraftRows: 0, publishedQuizzesUnchanged: publishedBefore!.length })
