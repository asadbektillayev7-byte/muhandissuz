import assert from 'node:assert/strict'
import test from 'node:test'
import { createQuizImportFetch } from '../scripts/lib/quiz-import-fetch'

test('GET and HEAD network failures retry up to three times with bounded backoff and read timeouts', async () => {
  for (const method of ['GET', 'HEAD']) {
    let calls = 0
    const waits: number[] = []
    const request = createQuizImportFetch({
      request: async (_input, init) => {
        calls++
        assert.equal(init?.method, method)
        assert.ok(init?.signal instanceof AbortSignal)
        if (calls < 3) throw new TypeError('fetch failed')
        return new Response(null, { status: 200 })
      },
      wait: async milliseconds => { waits.push(milliseconds) },
    })
    assert.equal((await request('https://fixture.example.test/read', { method })).status, 200)
    assert.equal(calls, 3)
    assert.deepEqual(waits, [250, 500])
  }
})

test('persistent read failures stop at three attempts and completed HTTP errors are not retried', async () => {
  let calls = 0
  const networkError = new TypeError('fetch failed')
  const request = createQuizImportFetch({ request: async () => { calls++; throw networkError }, wait: async () => {} })
  await assert.rejects(() => request('https://fixture.example.test/read'), error => error === networkError)
  assert.equal(calls, 3)

  calls = 0
  const httpRequest = createQuizImportFetch({ request: async () => { calls++; return new Response(null, { status: 503 }) }, wait: async () => { throw new Error('Should not retry HTTP responses') } })
  assert.equal((await httpRequest('https://fixture.example.test/read')).status, 503)
  assert.equal(calls, 1)
})

test('POST, PATCH and DELETE writes are attempted exactly once, including Request-derived methods', async () => {
  for (const method of ['POST', 'PATCH', 'DELETE']) {
    for (const asRequest of [false, true]) {
      let calls = 0
      const networkError = new TypeError('write outcome unknown')
      const request = createQuizImportFetch({ request: async () => { calls++; throw networkError }, wait: async () => { throw new Error('A write must never retry') } })
      await assert.rejects(() => asRequest
        ? request(new Request('https://fixture.example.test/write', { method }))
        : request('https://fixture.example.test/write', { method }), error => error === networkError)
      assert.equal(calls, 1)
    }
  }
})

test('caller cancellation stops retries and preserves the request headers and body on writes', async () => {
  const controller = new AbortController()
  let calls = 0
  const request = createQuizImportFetch({
    request: async (_input, init) => {
      calls++
      controller.abort(new Error('Cancelled by caller'))
      throw init?.signal?.reason
    },
    wait: async () => { throw new Error('Cancelled reads must not retry') },
  })
  await assert.rejects(() => request('https://fixture.example.test/read', { signal: controller.signal }), /Cancelled by caller/)
  assert.equal(calls, 1)

  const input = { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"published":false}' }
  const write = createQuizImportFetch({ request: async (_url, init) => { assert.equal(init, input); return new Response(null, { status: 201 }) } })
  assert.equal((await write('https://fixture.example.test/write', input)).status, 201)
})
