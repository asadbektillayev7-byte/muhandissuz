import assert from 'node:assert/strict'
import { register } from 'node:module'
import test from 'node:test'
import { ARTICLE_SAVE_MAX_BYTES, type ArticleSaveResult } from '../src/lib/article-save-result'

// Run the real Server Action, validation and sanitizer. Only the external auth,
// database and Next cache boundary are replaced; these tests never write live data.
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/cache') return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const revalidatePath = (...args) => globalThis.__articleSaveHarness.revalidate(...args)') };
  if (specifier === 'next/headers') return { shortCircuit: true, url: 'data:text/javascript,' + encodeURIComponent('export const headers = async () => new Headers()') };
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('/src/lib/supabase/server.ts')) return { format: 'module', shortCircuit: true, source: 'export const createClient = async () => globalThis.__articleSaveHarness.authClient' };
  if (url.endsWith('/src/lib/supabase/admin.ts')) return { format: 'module', shortCircuit: true, source: 'export const createAdminClient = () => globalThis.__articleSaveHarness.adminClient()' };
  if (url.endsWith('/src/lib/article-content.ts')) return { format: 'module', shortCircuit: true, source: 'export * from ' + JSON.stringify(url + '?actual-sanitizer') + '; import {articleBodyToHtml as actual} from ' + JSON.stringify(url + '?actual-sanitizer') + '; export const articleBodyToHtml = (body) => { if (globalThis.__articleSaveHarness.sanitizerError) throw globalThis.__articleSaveHarness.sanitizerError; return actual(body); }' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

const { adminSaveArticle } = await import('../src/lib/actions')
const adminEmail = 'admin@example.test'
const valid = () => ({
  slug: 'yangi-maqola', title_uz: "O'zbek muhandislari", title_en: '', title_ru: '',
  body_uz: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello <script>literal</script>', marks: [{ type: 'bold' }] }] }, { type: 'image', attrs: { src: 'https://storage.example.test/article-images/a.webp', alt: 'Tajriba', width: 1200, height: 800 } }] },
  body_en: null, body_ru: null, excerpt_uz: '', excerpt_en: '', excerpt_ru: '',
  meta_description_uz: '', meta_description_en: '', meta_description_ru: '',
  category_id: null, author_id: null, translator_id: null,
  cover_image_url: '', og_image_url: '', original_language: 'uz',
  department_leader: '', editor: '', translator: '', researcher: '',
  tags: ['texnologiya', 'texnologiya', 'muhandislik'], published: true,
  published_date: '2026-10-13T04:30:00.000Z',
})
type DbError = { code: string; message?: string; details?: string }
type Harness = ReturnType<typeof harness>
function harness() {
  const state = {
    authError: null as Error | null,
    authUser: { email: adminEmail } as { email: string } | null,
    dbError: null as DbError | null,
    duplicateError: null as DbError | null,
    duplicate: null as { id: number } | null,
    configError: null as Error | null,
    sanitizerError: null as Error | null,
    cacheError: null as Error | null,
    writes: [] as { operation: string; values: Record<string, unknown> }[],
    filters: [] as [string, string, unknown][],
    revalidated: [] as unknown[][],
    databaseCalls: 0,
    authClient: { auth: { getUser: async () => ({ data: { user: state.authUser }, error: state.authError }) } },
    adminClient: () => {
      state.databaseCalls++
      if (state.configError) throw state.configError
      return { from: (table: string) => {
        assert.equal(table, 'articles')
        const query = {
          select: (_columns: string) => query,
          eq: (column: string, value: unknown) => { state.filters.push(['eq', column, value]); return query },
          neq: (column: string, value: unknown) => { state.filters.push(['neq', column, value]); return query },
          maybeSingle: async () => ({ data: state.duplicate, error: state.duplicateError }),
          insert: (values: Record<string, unknown>) => { state.writes.push({ operation: 'insert', values }); return query },
          update: (values: Record<string, unknown>) => { state.writes.push({ operation: 'update', values }); return query },
          single: async () => ({ data: state.dbError ? null : { id: 42, slug: 'yangi-maqola', published: true, published_date: '2026-10-13T04:30:00.000Z' }, error: state.dbError }),
        }
        return query
      } }
    },
    revalidate: (...args: unknown[]) => { state.revalidated.push(args); if (state.cacheError) throw state.cacheError },
  }
  return state
}
async function withHarness(run: (state: Harness, logs: unknown[][]) => Promise<void>) {
  const global = globalThis as unknown as Record<string, unknown>
  const priorEmail = process.env.ADMIN_EMAIL
  const priorConsole = console.error
  const logs: unknown[][] = []
  const state = harness()
  global.__articleSaveHarness = state
  process.env.ADMIN_EMAIL = adminEmail
  console.error = (...args: unknown[]) => { logs.push(args) }
  try { await run(state, logs) }
  finally { console.error = priorConsole; if (priorEmail === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = priorEmail; delete global.__articleSaveHarness }
}
function expectFailure(result: ArticleSaveResult, code: string) {
  assert.equal(result.ok, false)
  if (result.ok) throw new Error('Expected failure')
  assert.equal(result.error.code, code)
  assert.ok(result.error.message.includes('/'), 'A readable UZ/EN message crosses the boundary as data')
  return result.error
}

test('real save action sanitizes a normal multilingual payload and returns the saved article', async () => withHarness(async state => {
  const result = await adminSaveArticle(valid())
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.article.id, 42)
  assert.equal(state.writes.length, 1)
  const saved = state.writes[0].values
  assert.equal(typeof saved.body_uz, 'string')
  assert.match(String(saved.body_uz), /<strong>Hello &lt;script&gt;literal&lt;\/script&gt;<\/strong>/)
  assert.match(String(saved.body_uz), /https:\/\/storage.example.test\/article-images\/a.webp/)
  assert.equal(saved.body_en, '')
  assert.equal(saved.title_en, '')
  assert.equal(saved.body_ru, '')
  assert.equal(saved.cover_image_url, null)
  assert.equal(saved.og_image_url, null)
  assert.equal(saved.author_id, null)
  assert.deepEqual(saved.tags, ['texnologiya', 'muhandislik'])
  assert.equal(saved.published_date, '2026-10-13T04:30:00.000Z')
  assert.ok(state.revalidated.some(args => args[0] === '/ru/articles'))
  const update = await adminSaveArticle(valid(), 42)
  assert.equal(update.ok, true)
  assert.equal(state.writes[1].operation, 'update')
  assert.ok(state.filters.some(([op, field, value]) => op === 'neq' && field === 'id' && value === 42))
  assert.ok(state.filters.some(([op, field, value]) => op === 'eq' && field === 'id' && value === 42))
}))

test('authentication and expected validation failures return safe results without writes', async () => withHarness(async state => {
  state.authUser = null
  expectFailure(await adminSaveArticle(valid()), 'UNAUTHENTICATED')
  state.authUser = { email: 'someone-else@example.test' }
  expectFailure(await adminSaveArticle(valid()), 'FORBIDDEN')
  state.authUser = { email: adminEmail }
  const cases: [Record<string, unknown>, string][] = [
    [{ slug: 'Bad slug' }, 'INVALID_SLUG'],
    [{ title_uz: '' }, 'MISSING_UZBEK_CONTENT'],
    [{ body_uz: null }, 'MISSING_UZBEK_CONTENT'],
    [{ body_ru: { type: 'doc', content: [{ type: 'image', attrs: { uploadId: 'pending', src: '' } }] } }, 'UNFINISHED_IMAGES'],
    [{ published_date: '' }, 'INVALID_PUBLICATION_DATE'],
    [{ author_id: '12' }, 'INVALID_RELATED_RECORD'],
    [{ category_id: 0 }, 'INVALID_RELATED_RECORD'],
    [{ cover_image_url: 'javascript:alert(1)' }, 'INVALID_IMAGE_URL'],
    [{ title_en: 'x'.repeat(2_000_001) }, 'ARTICLE_TOO_LARGE'],
  ]
  for (const [patch, code] of cases) expectFailure(await adminSaveArticle({ ...valid(), ...patch }), code)
  expectFailure(await adminSaveArticle(valid(), -1), 'INVALID_ARTICLE_ID')
  expectFailure(await adminSaveArticle(null as never), 'INVALID_PAYLOAD')
  assert.equal(state.writes.length, 0)
  assert.equal(state.databaseCalls, 0)
}))

test('duplicate URL and schema failures remain readable across the action boundary', async () => withHarness(async state => {
  state.duplicate = { id: 7 }
  const duplicate = expectFailure(await adminSaveArticle(valid()), 'SLUG_CONFLICT')
  assert.match(duplicate.message, /another article/)
  assert.equal(state.writes.length, 0)
  state.duplicate = null
  state.duplicateError = { code: 'XX000', message: 'private-database-detail' }
  const lookup = expectFailure(await adminSaveArticle(valid()), 'SLUG_CHECK_FAILED')
  assert.ok(lookup.reference)
  assert.doesNotMatch(JSON.stringify(lookup), /private-database-detail/)
  assert.equal(state.writes.length, 0)
  state.duplicateError = null
  state.dbError = { code: 'PGRST204', message: 'column title_ru missing' }
  const missing = expectFailure(await adminSaveArticle(valid()), 'SCHEMA_NOT_READY')
  assert.match(missing.message, /migration_v13.sql/)
  assert.ok(missing.reference)
  assert.equal(state.revalidated.length, 0)
}))

test('database conflicts distinguish slug, primary key, and unrelated unique constraints', async () => withHarness(async state => {
  const cases: [DbError, string][] = [
    [{ code: '23505', message: 'duplicate key value violates unique constraint "articles_slug_key"', details: 'Key (slug)=(private-title) already exists.' }, 'SLUG_CONFLICT'],
    [{ code: '23505', message: 'duplicate key value violates unique constraint "articles_pkey"', details: 'Key (id)=(25) already exists.' }, 'ARTICLE_ID_CONFLICT'],
    [{ code: '23505', message: 'duplicate key value violates unique constraint "custom_unique"', details: 'Key (other_value)=(private-title) already exists.' }, 'SAVE_CONFLICT'],
    [{ code: '23503', message: 'private foreign key detail' }, 'RELATED_RECORD_MISSING'],
    [{ code: 'PGRST116', message: 'no row' }, 'ARTICLE_NOT_FOUND'],
    [{ code: '42501', message: 'private permission detail' }, 'DATABASE_ACCESS_DENIED'],
    [{ code: 'XX000', message: 'private-provider-error' }, 'SAVE_FAILED'],
  ]
  for (const [error, code] of cases) {
    state.dbError = error
    const outcome = expectFailure(await adminSaveArticle(valid(), 42), code)
    assert.ok(outcome.reference)
    assert.doesNotMatch(JSON.stringify(outcome), /private|articles_pkey|custom_unique/)
  }
  assert.equal(state.revalidated.length, 0)
}))

test('unexpected content/configuration exceptions return a reference without exposing diagnostics', async () => withHarness(async (state, logs) => {
  state.sanitizerError = new Error('private serializer diagnostic')
  const sanitizer = expectFailure(await adminSaveArticle(valid()), 'UNEXPECTED_SAVE_ERROR')
  assert.ok(sanitizer.reference)
  assert.doesNotMatch(JSON.stringify(sanitizer), /private serializer diagnostic/)
  assert.equal(state.writes.length, 0)
  assert.equal(state.databaseCalls, 0)
  assert.ok(logs.some(log => (log[1] as { stage: string; reference: string }).stage === 'content' && (log[1] as { reference: string }).reference === sanitizer.reference))
  state.sanitizerError = null
  state.configError = new Error('private configuration detail')
  const config = expectFailure(await adminSaveArticle(valid()), 'UNEXPECTED_SAVE_ERROR')
  assert.ok(config.reference)
  assert.doesNotMatch(JSON.stringify(config), /private configuration detail/)
  assert.equal(state.writes.length, 0)
}))

test('cache errors after a committed write return success so the form keeps the ID', async () => withHarness(async (state, logs) => {
  state.cacheError = new Error('private cache diagnostic')
  const result = await adminSaveArticle(valid())
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.article.id, 42)
  assert.match(result.warning || '', /Article saved/)
  assert.doesNotMatch(result.warning || '', /private cache diagnostic/)
  assert.equal(state.writes.length, 1)
  assert.equal(state.writes[0].operation, 'insert')
  assert.ok(logs.some(log => (log[1] as { stage: string }).stage === 'cache-revalidation'))
}))


test('UTF-8 size limit catches a multibyte document before any database access', async () => withHarness(async state => {
  const data = { ...valid(), title_en: '文'.repeat(700_000) }
  assert.ok(JSON.stringify(data).length < ARTICLE_SAVE_MAX_BYTES)
  assert.ok(new TextEncoder().encode(JSON.stringify(data)).byteLength > ARTICLE_SAVE_MAX_BYTES)
  expectFailure(await adminSaveArticle(data), 'ARTICLE_TOO_LARGE')
  assert.equal(state.databaseCalls, 0)
  assert.equal(state.writes.length, 0)
}))

test('a minimal draft accepts empty optional fields, missing date and absent translations', async () => withHarness(async state => {
  const before = Date.now()
  const result = await adminSaveArticle({ slug: 'empty-draft', published: false })
  assert.equal(result.ok, true)
  assert.equal(state.writes.length, 1)
  const values = state.writes[0].values
  assert.equal(values.published, false)
  assert.equal(values.title_uz, '')
  assert.equal(values.body_uz, '')
  assert.equal(values.body_en, '')
  assert.equal(values.body_ru, '')
  assert.equal(values.translator_id, null)
  assert.deepEqual(values.tags, [])
  assert.ok(Date.parse(String(values.published_date)) >= before)
}))
