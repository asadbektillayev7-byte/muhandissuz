import assert from 'node:assert/strict'
import { register } from 'node:module'
import test from 'node:test'
import { createClient } from '@supabase/supabase-js'

register(`data:text/javascript,${encodeURIComponent(`
export async function load(url, context, nextLoad) {
  if (url.endsWith('/src/lib/supabase/public.ts')) return { format: 'module', shortCircuit: true, source: 'export const createPublicClient = () => globalThis.__publicQuizClient' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

const { getQuizzes, getQuizBySlug, getQuizQuestions, getQuizArticles, getQuizStats, getQuizzesForArticles } = await import('../src/lib/supabase/quiz-queries')

test('real public query builders exclude drafts from routes, questions, links, recommendations and counts', async () => {
  const quizzes = [
    { id: 1, slug: 'published', published: true, categories: null, quiz_questions: [{ count: 2 }], quiz_articles: [{ count: 1 }] },
    { id: 2, slug: 'draft', published: false, categories: null, quiz_questions: [{ count: 1 }], quiz_articles: [{ count: 1 }] },
  ]
  const data: Record<string, Record<string, any>[]> = {
    quizzes,
    quiz_questions: [{ id: 10, quiz_id: 1 }, { id: 11, quiz_id: 1 }, { id: 20, quiz_id: 2 }],
    quiz_articles: [{ quiz_id: 1, article_id: 7, articles: { id: 7, slug: 'visible-source' } }, { quiz_id: 2, article_id: 8, articles: { id: 8, slug: 'draft-source' } }],
    categories: [{ id: 1 }, { id: 2 }],
  }

  // Use the real Supabase/PostgREST query builder. The HTTP boundary deliberately
  // returns drafts unless the request filters them, independent of database RLS.
  const client = createClient('https://quiz-fixture.example.test', 'test-anon-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      const url = new URL(String(input))
      const table = url.pathname.split('/').at(-1)!
      let rows = [...data[table]]
      for (const [column, filter] of url.searchParams) {
        if (column === 'quizzes.published') {
          if (url.searchParams.get('select')?.includes('quizzes!inner(')) {
            rows = rows.filter(row => quizzes.find(quiz => quiz.id === row.quiz_id)?.published === (filter === 'eq.true'))
          }
        } else if (filter.startsWith('eq.')) {
          rows = rows.filter(row => String(row[column]) === filter.slice(3))
        } else if (filter.startsWith('in.(')) {
          const allowed = filter.slice(4, -1).split(',')
          rows = rows.filter(row => allowed.includes(String(row[column])))
        }
      }
      const head = init?.method === 'HEAD'
      return new Response(head ? null : JSON.stringify(rows), {
        status: 200,
        headers: { 'content-type': 'application/json', 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : '*/0' },
      })
    } },
  })
  const global = globalThis as unknown as Record<string, unknown>
  global.__publicQuizClient = client
  try {
    assert.deepEqual((await getQuizzes()).map(quiz => quiz.id), [1])
    assert.equal((await getQuizBySlug('published'))?.id, 1)
    assert.equal(await getQuizBySlug('draft'), null)
    assert.deepEqual((await getQuizQuestions(1)).map(question => question.id), [10, 11])
    assert.deepEqual(await getQuizQuestions(2), [])
    assert.deepEqual((await getQuizArticles(1)).map(article => article.id), [7])
    assert.deepEqual(await getQuizArticles(2), [])
    assert.deepEqual((await getQuizzesForArticles([7, 8])).map(quiz => quiz.id), [1])
    assert.deepEqual(await getQuizzesForArticles([8]), [])
    assert.deepEqual(await getQuizStats(), { quizzes: 1, questions: 2, articles: 1, fields: 2 })
  } finally {
    delete global.__publicQuizClient
  }
})
