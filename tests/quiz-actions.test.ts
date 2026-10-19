import assert from 'node:assert/strict'
import { register } from 'node:module'
import test from 'node:test'

// Exercise the real actions and content reader with in-memory auth/database/cache
// boundaries. No Supabase writes or AI requests leave this process.
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/cache') return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const revalidatePath = (...args) => globalThis.__quizActionHarness.revalidated.push(args)') };
  if (specifier === 'next/headers') return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const headers = async () => new Headers()') };
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('/src/lib/supabase/server.ts')) return { format: 'module', shortCircuit: true, source: 'export const createClient = async () => globalThis.__quizActionHarness.authClient' };
  if (url.endsWith('/src/lib/supabase/admin.ts')) return { format: 'module', shortCircuit: true, source: 'export const createAdminClient = () => globalThis.__quizActionHarness.adminClient()' };
  if (url.endsWith('/src/lib/quizGeneration.ts')) return { format: 'module', shortCircuit: true, source: 'export * from ' + JSON.stringify(url + '?actual-reader') + '; export const generateQuestions = async (input) => globalThis.__quizActionHarness.generate(input)' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

const {
  adminSaveRecord, adminDeleteRecord, adminSetQuizArticles, adminSetFeaturedQuiz,
  adminGenerateQuizQuestions, adminSaveGeneratedQuestions,
} = await import('../src/lib/actions')

const email = 'quiz-admin@example.test'
const question = {
  question_uz: 'Dvigatel nima qiladi?', question_en: 'What does the motor do?',
  options_uz: ['Aylantiradi', 'Sovitadi', 'Qizdiradi', 'Bo‘yaydi'],
  options_en: ['Rotates', 'Cools', 'Heats', 'Paints'], correct_index: 0,
  explanation_uz: 'Dvigatel energiyani harakatga aylantiradi.', explanation_en: 'It converts energy into motion.',
}

function harness() {
  const state = {
    user: { email } as { email: string } | null,
    databaseCalls: 0,
    rows: {
      quizzes: [{ id: 1, published: true, featured: true }],
      quiz_questions: [{ id: 10, quiz_id: 1, sort_order: 2 }],
      quiz_articles: [{ quiz_id: 1, article_id: 7 }],
      articles: [{ id: 7, title_uz: 'Dvigatellar', body_uz: `<p>${'Dvigatel elektr energiyasini mexanik harakatga aylantiradi. '.repeat(8)}</p>`, published: true, published_date: '2020-01-01T00:00:00.000Z' }],
      partners: [],
    } as Record<string, Record<string, any>[]>,
    writes: [] as { table: string; operation: string; values: any }[],
    revalidated: [] as unknown[][],
    generated: [] as { articles: { title: string; body: string }[]; count: number }[],
    fail: null as { table: string; operation: string } | null,
    authClient: { auth: { getUser: async () => ({ data: { user: state.user }, error: null }) } },
    generate: (input: { articles: { title: string; body: string }[]; count: number }) => {
      state.generated.push(input)
      return Array.from({ length: input.count }, () => question)
    },
    adminClient: () => {
      state.databaseCalls++
      return { from: (table: string) => {
        let operation = 'read', values: any
        const filters: ((row: Record<string, any>) => boolean)[] = []
        let sort: { key: string; ascending: boolean } | undefined, limit: number | undefined
        const execute = () => {
          if (state.fail?.table === table && state.fail.operation === operation) return { data: null, error: { message: 'Test database failure' } }
          let rows = (state.rows[table] ?? []).filter(row => filters.every(filter => filter(row)))
          if (operation !== 'read') state.writes.push({ table, operation, values })
          if (operation === 'insert') {
            rows = (Array.isArray(values) ? values : [values]).map((row, index) => ({ id: 100 + index, ...row }))
            state.rows[table] = [...(state.rows[table] ?? []), ...rows]
          } else if (operation === 'update') {
            rows.forEach(row => Object.assign(row, values))
          } else if (operation === 'delete') {
            state.rows[table] = state.rows[table].filter(row => !rows.includes(row))
          }
          if (sort) rows.sort((a, b) => (a[sort!.key] - b[sort!.key]) * (sort!.ascending ? 1 : -1))
          if (limit !== undefined) rows = rows.slice(0, limit)
          return { data: rows, error: null }
        }
        const query: any = {
          select: () => query,
          eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return query },
          neq: (key: string, value: unknown) => { filters.push(row => row[key] !== value); return query },
          in: (key: string, values: unknown[]) => { filters.push(row => values.includes(row[key])); return query },
          lte: (key: string, value: string) => { filters.push(row => typeof row[key] === 'string' && row[key] <= value); return query },
          order: (key: string, options?: { ascending?: boolean }) => { sort = { key, ascending: options?.ascending !== false }; return query },
          limit: (value: number) => { limit = value; return query },
          insert: (data: any) => { operation = 'insert'; values = data; return query },
          update: (data: any) => { operation = 'update'; values = data; return query },
          delete: () => { operation = 'delete'; return query },
          then: (resolve: any, reject: any) => Promise.resolve(execute()).then(resolve, reject),
        }
        return query
      } }
    },
  }
  return state
}

async function withHarness(run: (state: ReturnType<typeof harness>) => Promise<void>) {
  const global = globalThis as unknown as Record<string, unknown>
  const previousEmail = process.env.ADMIN_EMAIL
  const state = harness()
  process.env.ADMIN_EMAIL = email
  global.__quizActionHarness = state
  try { await run(state) }
  finally {
    delete global.__quizActionHarness
    if (previousEmail === undefined) delete process.env.ADMIN_EMAIL
    else process.env.ADMIN_EMAIL = previousEmail
  }
}

function assertQuizCaches(state: ReturnType<typeof harness>) {
  for (const path of ['/admin/quiz', '/admin/quiz/[id]', '/admin/quiz/[id]/preview', '/uz/quiz', '/en/quiz', '/[locale]/quiz/[slug]', '/[locale]/articles/[slug]']) {
    assert.ok(state.revalidated.some(args => args[0] === path), `Revalidate ${path}`)
  }
}

test('new quiz writes force drafts without mutating input or unpublishing existing quizzes', async () => withHarness(async state => {
  const input = Object.freeze({ title_uz: 'Yangi quiz', published: true })
  await adminSaveRecord('quizzes', input)
  assert.equal(state.writes[0].values.published, false)
  assert.equal(input.published, true)
  await adminSaveRecord('quizzes', { title_uz: 'Boshqa quiz' })
  assert.equal(state.writes[1].values.published, false)
  await adminSaveRecord('quizzes', { title_uz: 'Yangilangan quiz' }, 1)
  assert.equal(state.rows.quizzes[0].published, true)
  await adminSaveRecord('quizzes', { published: false }, 1)
  await adminSaveRecord('quizzes', { published: true }, 1)
  assert.equal(state.rows.quizzes[0].published, true)
  await adminSaveRecord('partners', { published: true })
  assert.equal(state.rows.partners[0].published, true, 'unrelated saves retain their behavior')
  assertQuizCaches(state)
}))

test('authentication failures cannot reach quiz writes or invalidate caches', async () => withHarness(async state => {
  for (const user of [null, { email: 'someone-else@example.test' }]) {
    state.user = user
    await assert.rejects(() => adminSaveRecord('quizzes', { published: true }), /Not authenticated|Not authorized/)
    await assert.rejects(() => adminDeleteRecord('quizzes', 1), /Not authenticated|Not authorized/)
  }
  assert.equal(state.databaseCalls, 0)
  assert.equal(state.writes.length, 0)
  assert.equal(state.revalidated.length, 0)
}))

test('all quiz mutation paths invalidate visitor and admin views', async () => {
  const actions = [
    () => adminSaveRecord('quiz_questions', { quiz_id: 1, ...question }),
    () => adminDeleteRecord('quizzes', 1),
    () => adminDeleteRecord('quiz_questions', 10),
    () => adminSetQuizArticles(1, [7, 7]),
    () => adminSetFeaturedQuiz(1, true),
    () => adminSaveGeneratedQuestions(1, [question]),
  ]
  for (const action of actions) await withHarness(async state => {
    await action()
    assertQuizCaches(state)
  })
})

test('a failed replacement still invalidates committed removal; a failed read does not append questions', async () => withHarness(async state => {
  state.fail = { table: 'quiz_articles', operation: 'insert' }
  await assert.rejects(() => adminSetQuizArticles(1, [7]), /Test database failure/)
  assert.equal(state.rows.quiz_articles.length, 0)
  assertQuizCaches(state)
  state.fail = { table: 'quiz_questions', operation: 'read' }
  await assert.rejects(() => adminSaveGeneratedQuestions(1, [question]), /Test database failure/)
  assert.equal(state.rows.quiz_questions.length, 1)
}))

test('generation accepts current published articles and rejects drafts, scheduled dates, missing bodies and invalid counts before AI', async () => withHarness(async state => {
  assert.equal((await adminGenerateQuizQuestions(1, 4)).length, 4)
  assert.equal(state.generated.length, 1)
  assert.match(state.generated[0].articles[0].body, /Dvigatel elektr/)
  for (const patch of [
    { published: false }, { published_date: '2999-01-01T00:00:00.000Z' },
    { body_uz: '<p>Short</p>' }, { title_uz: '' },
  ]) {
    const original = { ...state.rows.articles[0] }
    Object.assign(state.rows.articles[0], patch)
    await assert.rejects(() => adminGenerateQuizQuestions(1, 4))
    state.rows.articles[0] = original
  }
  for (const count of [0, -1, 16, 1.5, NaN, Infinity]) await assert.rejects(() => adminGenerateQuizQuestions(1, count))
  assert.equal(state.generated.length, 1)
  assert.equal(state.writes.length, 0, 'generation only returns reviewable drafts')
}))
