import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { register } from 'node:module'
import test from 'node:test'
import {
  questionRows, readQuizDraftBatch, sourceHash, validateQuizDraftBatch,
  type ArticleQuizDraft, type QuizSource,
} from '../scripts/lib/quiz-draft-data'

const plain = 'An electric motor converts electrical energy into mechanical motion. Its rotor turns while its stator remains stationary.'
const now = Date.parse('2026-10-19T00:00:00.000Z')
function source(): QuizSource & { body_uz: string; category_id: number } {
  return { id: 1, slug: 'electric-motors', title_uz: 'Dvigatellar', plain_uz: plain, body_uz: plain,
    category_id: 3, categories: { slug: 'mechanical-engineering' }, published: true, published_date: '2020-01-01T00:00:00.000Z' }
}
function draft(): ArticleQuizDraft {
  return {
    article_id: 1, article_slug: source().slug, source_title: source().title_uz,
    source_sha256: sourceHash(plain), slug: 'maqola-electric-motors', category_slug: 'mechanical-engineering',
    title_uz: 'Dvigatellar haqida quiz', title_en: 'Electric motors quiz', description_uz: 'Dvigatel qanday ishlaydi?',
    description_en: 'How does a motor work?', duration_minutes: 3,
    questions: Array.from({ length: 4 }, (_, index) => ({
      question_uz: `Dvigatel haqidagi ${index + 1}-savol?`, question_en: `Motor question ${index + 1}?`,
      options_uz: ['A javob', 'B javob', 'C javob', 'D javob'], options_en: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
      correct_index: index, explanation_uz: 'Maqolada izohlangan.', explanation_en: 'Explained in the article.',
      evidence: { quote: 'Its rotor turns while its stator remains stationary.', learning_objective: `Understand motor principle ${index + 1}.` },
    })),
  }
}

test('the reviewed manifest covers 23 distinct article quizzes and 92 questions, with empty articles explicitly pending', async () => {
  const batch = await readQuizDraftBatch()
  const manifest = JSON.parse(await readFile(new URL('../content/quiz-drafts/manifest.json', import.meta.url), 'utf8'))
  assert.deepEqual(validateQuizDraftBatch(batch), { quizzes: 23, questions: 92 })
  assert.equal(manifest.quiz_count, 23)
  assert.equal(manifest.question_count, 92)
  assert.equal(manifest.status, 'draft')
  assert.deepEqual(batch.map(item => item.article_id), manifest.source_article_ids)
  const covered = new Set([...manifest.source_article_ids, ...manifest.pending_articles.map((item: { id: number }) => item.id)])
  assert.equal(covered.size, manifest.published_article_count)
  assert.equal(manifest.source_article_ids.length + manifest.pending_articles.length, covered.size)
  assert.ok(manifest.pending_articles.every((item: { reason: string }) => item.reason.length > 0))
})

test('batch validation rejects incomplete questions, duplicate choices, unsafe indices and publication directives', () => {
  assert.deepEqual(validateQuizDraftBatch([draft()], [source()], now), { quizzes: 1, questions: 4 })
  assert.throws(() => validateQuizDraftBatch([]), /No quiz drafts/)
  assert.throws(() => validateQuizDraftBatch([draft(), draft()]), /duplicate article/)
  const mutations: ((item: ArticleQuizDraft) => void)[] = [
    item => { item.questions.pop() },
    item => { item.questions[0].options_uz[1] = ' a JAVOB ' },
    item => { item.questions[0].options_en[1] = ' answer a ' },
    item => { item.questions[0].options_en[1] = '' },
    item => { item.questions[0].correct_index = -1 },
    item => { item.questions[0].correct_index = 4 },
    item => { item.questions[0].correct_index = 1.5 },
    item => { item.questions[0].correct_index = NaN },
    item => { item.questions[1].correct_index = 0 },
    item => { item.questions[1].question_uz = item.questions[0].question_uz },
    item => { item.questions[0].evidence.quote = '' },
    item => { item.title_en = '' },
    item => { Object.assign(item, { published: true }) },
    item => { Object.assign(item, { difficulty: 'easy' }) },
  ]
  for (const mutate of mutations) {
    const item = draft()
    mutate(item)
    assert.throws(() => validateQuizDraftBatch([item], [source()], now))
  }
})

test('source validation fails closed when articles are missing, unpublished, changed or no longer covered', () => {
  assert.throws(() => validateQuizDraftBatch([draft()], [], now), /no longer publicly published/)
  for (const patch of [
    { published: false }, { published_date: '2999-01-01T00:00:00.000Z' }, { published_date: 'invalid' },
    { title_uz: 'Changed title' }, { slug: 'changed-url' }, { categories: null }, { plain_uz: `${plain} Changed content.` },
  ]) assert.throws(() => validateQuizDraftBatch([draft()], [{ ...source(), ...patch }], now))
  const wrongEvidence = draft()
  wrongEvidence.questions[0].evidence.quote = 'A statement absent from the article.'
  assert.throws(() => validateQuizDraftBatch([wrongEvidence], [source()], now), /evidence is not in the source/)
  assert.throws(() => validateQuizDraftBatch([draft()], [source(), { ...source(), id: 2 }], now), /Published articles need new drafts: 2/)
  assert.deepEqual(validateQuizDraftBatch([draft()], [source(), { ...source(), id: 2, plain_uz: '' }], now), { quizzes: 1, questions: 4 })
})

test('question rows project only database content columns, preserving answer indices and importer-owned order', () => {
  const item = draft()
  Object.assign(item.questions[0], { id: 999, quiz_id: 999, sort_order: 999, published: true, unexpected: 'not a column' })
  const rows = questionRows(item, 42)
  assert.equal(rows.length, 4)
  assert.deepEqual(rows.map(row => row.quiz_id), [42, 42, 42, 42])
  assert.deepEqual(rows.map(row => row.sort_order), [0, 1, 2, 3])
  assert.deepEqual(rows.map(row => row.correct_index), [0, 1, 2, 3])
  assert.deepEqual(Object.keys(rows[0]).sort(), ['quiz_id', 'question_uz', 'question_en', 'options_uz', 'options_en', 'correct_index', 'explanation_uz', 'explanation_en', 'sort_order'].sort())
  assert.ok(item.questions[0].evidence.quote, 'editorial evidence remains in the review data')
})

// The actual CLI is imported below with only its external boundaries replaced.
// The real validation/projection remains active, and receipt writes stay in memory.
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'dotenv') return { shortCircuit: true, url: 'data:text/javascript,export const config = () => ({})' };
  if (specifier === '@supabase/supabase-js') return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const createClient = (_url, key) => globalThis.__quizImportHarness.client(key === "service-fixture")') };
  if (specifier === 'node:fs/promises' && context.parentURL?.includes('/scripts/import-article-quiz-drafts.ts')) return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const writeFile = async (_url, text) => { globalThis.__quizImportHarness.receipt = JSON.parse(text) }') };
  const result = await nextResolve(specifier, context);
  if (result.url.includes('/scripts/lib/quiz-draft-data.ts') && context.parentURL?.includes('/scripts/import-article-quiz-drafts.ts')) return { ...result, url: result.url + '?importer-boundary' };
  return result;
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('?importer-boundary')) return { format: 'module', shortCircuit: true, source: 'export * from ' + JSON.stringify(url.replace('?importer-boundary', '')) + '; export const readQuizDraftBatch = async () => globalThis.__quizImportHarness.drafts' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

function importerHarness() {
  const item = draft()
  const state = {
    drafts: [item],
    rows: {
      articles: [source()],
      quizzes: [{ id: 9, slug: 'existing-published', title_uz: 'Existing quiz', published: true }],
      quiz_questions: [{ id: 90, quiz_id: 9, question_uz: 'Existing question', sort_order: 0 }],
      quiz_articles: [{ quiz_id: 9, article_id: 1 }],
    } as Record<string, Record<string, any>[]>,
    nextId: 100,
    writes: [] as { table: string; operation: string; values: any }[],
    failQuestions: false, exposeDrafts: false, failProbeCreation: false, failCleanup: false, failAnonRead: false,
    receipt: null as any,
    client: (admin: boolean) => ({ from: (table: string) => {
      let operation = 'read', values: any, columns = '', limit = Infinity, offset = 0
      let sort: string | undefined
      const filters: ((row: Record<string, any>) => boolean)[] = []
      function execute() {
        if (!admin && state.failAnonRead) return { data: null, error: { code: 'ANON_NET_FAIL', message: 'Anonymous fetch failed anon-fixture' }, status: 503 }
        let rows = state.rows[table].filter(row => filters.every(filter => filter(row)))
        if (!admin) rows = rows.filter(row => state.exposeDrafts || (table === 'quizzes' ? row.published : state.rows.quizzes.find(quiz => quiz.id === row.quiz_id)?.published))
        if (operation !== 'read') {
          assert.ok(admin, 'anonymous requests must never write')
          state.writes.push({ table, operation, values: structuredClone(values) })
        }
        if (operation === 'insert') {
          const incoming = Array.isArray(values) ? values : [values]
          if (state.failQuestions && table === 'quiz_questions' && incoming.some(row => row.question_uz !== 'Privacy check')) return { data: null, error: { message: 'Fixture insert failure' } }
          rows = incoming.map(row => ({ id: state.nextId++, ...structuredClone(row) }))
          state.rows[table].push(...rows)
          if (state.failProbeCreation && table === 'quizzes' && incoming.some(row => row.title_uz === 'Privacy check')) {
            // Model a committed insert whose HTTP response was lost.
            return { data: null, error: { code: 'PROBE_NET_FAIL', message: 'Probe response failed service-fixture' }, status: 503 }
          }
        } else if (operation === 'delete') {
          if (state.failCleanup && table === 'quizzes') return { data: null, error: { code: 'CLEANUP_NET_FAIL', message: 'Cleanup fetch failed anon-fixture service-fixture' }, status: 504 }
          state.rows[table] = state.rows[table].filter(row => !rows.includes(row))
          if (table === 'quizzes') for (const child of ['quiz_questions', 'quiz_articles']) state.rows[child] = state.rows[child].filter(row => !rows.some(quiz => quiz.id === row.quiz_id))
        }
        if (sort) rows.sort((a, b) => a[sort!] - b[sort!])
        const count = rows.length
        rows = rows.slice(offset, offset + limit)
        const data = rows.map(row => {
          if (columns.includes('quiz_questions(*)')) return { ...row, quiz_questions: state.rows.quiz_questions.filter(q => q.quiz_id === row.id).map(q => ({ ...q })), quiz_articles: state.rows.quiz_articles.filter(q => q.quiz_id === row.id).map(q => ({ ...q })) }
          if (columns === '*' || table === 'articles') return { ...row }
          return Object.fromEntries(columns.split(',').map(key => [key, row[key]]))
        })
        return { data, count, error: null }
      }
      const query: any = {
        select: (value = '*') => { columns = value; return query },
        eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return query },
        in: (key: string, value: unknown[]) => { filters.push(row => value.includes(row[key])); return query },
        lte: (key: string, value: string) => { filters.push(row => row[key] <= value); return query },
        order: (key: string) => { sort = key; return query },
        range: (start: number, end: number) => { offset = start; limit = end - start + 1; return query },
        insert: (data: any) => { operation = 'insert'; values = data; return query },
        delete: () => { operation = 'delete'; return query },
        single: async () => { const result = execute(); return { ...result, data: result.data?.[0] ?? null } },
        then: (resolve: any, reject: any) => Promise.resolve(execute()).then(resolve, reject),
      }
      return query
    } }),
  }
  return state
}

let invocation = 0
async function runImporter(state: ReturnType<typeof importerHarness>, apply = true) {
  const global = globalThis as unknown as Record<string, unknown>
  const keys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const
  const previousEnv = keys.map(key => process.env[key])
  const previousArgs = process.argv, previousExit = process.exit, previousLog = console.log
  global.__quizImportHarness = state
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fixture.example.test'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-fixture'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-fixture'
  process.argv = ['node', 'import-article-quiz-drafts.ts', ...(apply ? ['--apply'] : [])]
  const dryRunExit = new Error('Successful dry-run exit')
  process.exit = (() => { throw dryRunExit }) as typeof process.exit
  console.log = () => {}
  try {
    await import(`../scripts/import-article-quiz-drafts.ts?test=${++invocation}`)
  } catch (error) {
    if (error !== dryRunExit || apply) throw error
  } finally {
    delete global.__quizImportHarness
    keys.forEach((key, index) => { if (previousEnv[index] === undefined) delete process.env[key]; else process.env[key] = previousEnv[index] })
    process.argv = previousArgs; process.exit = previousExit; console.log = previousLog
  }
}

test('the actual importer is read-only by default and repeatable without touching existing published quizzes', async () => {
  const state = importerHarness()
  const before = structuredClone(state.rows)
  await runImporter(state, false)
  assert.deepEqual(state.rows, before)
  assert.equal(state.writes.length, 0)
  await runImporter(state)
  assert.equal(state.rows.quizzes.length, 2)
  assert.equal(state.rows.quizzes.find(quiz => quiz.slug === draft().slug)?.published, false)
  assert.equal(state.receipt.drafts.length, 1)
  assert.equal(state.receipt.drafts[0].questions, 4)
  const saved = structuredClone(state.rows)
  const writesBeforeRetry = state.writes.length
  await runImporter(state)
  assert.deepEqual(state.rows, saved)
  assert.ok(state.writes.slice(writesBeforeRetry).every(write => write.operation === 'delete' || (write.table !== 'quizzes' ? write.values.question_uz === 'Privacy check' || write.table === 'quiz_articles' : write.values.title_uz === 'Privacy check')), 'a retry writes only its privacy fixture')
  assert.deepEqual(state.rows.quizzes.find(quiz => quiz.id === 9), before.quizzes[0])
  assert.deepEqual(state.rows.quiz_questions.find(question => question.id === 90), before.quiz_questions[0])
})

test('privacy failures block real draft writes and insertion failures roll back only the newly created quiz', async () => {
  const exposed = importerHarness()
  exposed.exposeDrafts = true
  const exposedBefore = structuredClone(exposed.rows)
  await assert.rejects(() => runImporter(exposed), /Draft privacy check failed/)
  assert.deepEqual(exposed.rows, exposedBefore)
  const failed = importerHarness()
  failed.failQuestions = true
  const failedBefore = structuredClone(failed.rows)
  await assert.rejects(() => runImporter(failed), /Fixture insert failure/)
  assert.deepEqual(failed.rows, failedBefore)
})

test('an existing reviewed draft edited by an administrator is never overwritten or removed on retry', async () => {
  const state = importerHarness()
  await runImporter(state)
  state.rows.quiz_questions.find(question => question.quiz_id !== 9)!.question_uz = 'Administrator edited this wording.'
  const before = structuredClone(state.rows)
  const writesBefore = state.writes.length
  await assert.rejects(() => runImporter(state), /questions differ; refusing to overwrite/)
  assert.deepEqual(state.rows, before)
  assert.equal(state.writes.length, writesBefore)
})

test('probe creation with an unknown outcome is cleaned by its unique slug without retrying the insert', async () => {
  const state = importerHarness()
  state.failProbeCreation = true
  const before = structuredClone(state.rows)
  await assert.rejects(() => runImporter(state), (error: unknown) => {
    assert.match((error as Error).message, /Creating privacy fixture.*code=PROBE_NET_FAIL, status=503.*Probe response failed \[redacted\]/)
    return true
  })
  assert.deepEqual(state.rows, before)
  assert.equal(state.writes.filter(write => write.table === 'quizzes' && write.operation === 'insert').length, 1)
  assert.equal(state.writes.filter(write => write.operation === 'delete').length, 1)
})

test('cleanup failure preserves the primary error, stage, code and status while redacting all credential values', async () => {
  const state = importerHarness()
  state.failProbeCreation = true
  state.failCleanup = true
  await assert.rejects(() => runImporter(state), (error: unknown) => {
    assert.ok(error instanceof AggregateError)
    assert.equal(error.errors.length, 2)
    const diagnostics = [error.message, ...error.errors.map((failure: Error) => failure.message)].join('\n')
    assert.match(diagnostics, /Primary failure: Creating privacy fixture \[code=PROBE_NET_FAIL, status=503\]/)
    assert.match(diagnostics, /Cleanup failure: Privacy fixture cleanup .*\[code=CLEANUP_NET_FAIL, status=504\]/)
    assert.match(diagnostics, /quiz-privacy-check-/)
    assert.doesNotMatch(diagnostics, /anon-fixture|service-fixture/)
    return true
  })
  assert.equal(state.rows.quizzes.filter(quiz => quiz.slug === draft().slug).length, 0)
  assert.equal(state.rows.quizzes.find(quiz => quiz.id === 9)?.published, true)
  assert.equal(state.writes.filter(write => write.operation === 'delete').length, 1, 'cleanup is not retried automatically')
})

test('an anonymous network failure is reported as a transport failure rather than a missing privacy policy', async () => {
  const state = importerHarness()
  state.failAnonRead = true
  const before = structuredClone(state.rows)
  await assert.rejects(() => runImporter(state), (error: unknown) => {
    assert.match((error as Error).message, /Anonymous privacy read: quizzes \[code=ANON_NET_FAIL, status=503\]/)
    assert.doesNotMatch((error as Error).message, /migration_v14|anon-fixture/)
    return true
  })
  assert.deepEqual(state.rows, before)
})
