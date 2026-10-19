type FetchOptions = {
  request?: typeof fetch
  wait?: (milliseconds: number) => Promise<void>
  attempts?: number
  timeoutMs?: number
}

/** Retry only read requests. A failed write may already have committed. */
export function createQuizImportFetch({
  request = globalThis.fetch,
  wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  attempts = 3,
  timeoutMs = 15_000,
}: FetchOptions = {}): typeof fetch {
  return async (input, init) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (method !== 'GET' && method !== 'HEAD') return request(input, init)

    const callerSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined)
    for (let attempt = 0; attempt < attempts; attempt++) {
      callerSignal?.throwIfAborted()
      const timeout = AbortSignal.timeout(timeoutMs)
      const signal = callerSignal ? AbortSignal.any([callerSignal, timeout]) : timeout
      try {
        // HTTP errors are responses, not uncertain network failures; do not
        // retry permission/schema errors or other completed HTTP requests.
        return await request(input, { ...init, signal })
      } catch (error) {
        if (callerSignal?.aborted || attempt + 1 === attempts) throw error
        await wait(250 * (attempt + 1))
      }
    }
    throw new Error('No read attempts configured.')
  }
}
