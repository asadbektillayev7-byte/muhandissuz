import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { JSDOM } from 'jsdom'

// Exercise the actual React/ProseMirror paste/drop handlers in memory. Only the
// network/image codec boundary is replaced; no server, real account or Storage writes.
register(`data:text/javascript,${encodeURIComponent(`
export async function load(url, context, nextLoad) {
  if (url.endsWith('.module.css')) return { format: 'module', shortCircuit: true, source: 'export default new Proxy({}, {get: (_, name) => String(name)})' };
  if (url.endsWith('/article-editor-upload.ts')) return { format: 'module', shortCircuit: true, source: 'export const uploadEditorImage = (...args) => globalThis.__articleUploadMock(...args)' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

const docs = readFileSync(new URL('./fixtures/articles/google-docs.html', import.meta.url), 'utf8')
const word = readFileSync(new URL('./fixtures/articles/word.html', import.meta.url), 'utf8')

test('Mounted editor uploads every image across three Docs pastes, retries failures, and handles multi-file drop', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true, url: 'https://editor.example.test/admin/articles/new' })
  const window = dom.window
  const globals = globalThis as unknown as Record<string, unknown>
  const saved = new Map<string, PropertyDescriptor | undefined>()
  for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLImageElement', 'Node', 'Element', 'DocumentFragment', 'MutationObserver', 'getComputedStyle', 'DOMParser', 'Event', 'KeyboardEvent', 'MouseEvent', 'File', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    const value = (window as unknown as Record<string, unknown>)[name]
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: typeof value === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(name) ? value.bind(window) : value })
  }
  globals.IS_REACT_ACT_ENVIRONMENT = true
  // JSDOM has no layout engine; ProseMirror only needs stable selection geometry.
  window.Range.prototype.getClientRects = () => [] as unknown as DOMRectList
  window.Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) })
  window.HTMLElement.prototype.getBoundingClientRect = window.Range.prototype.getBoundingClientRect
  window.scrollBy = () => {}
  const { createElement, act, useState } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { TiptapEditor } = await import('../src/app/admin/(dashboard)/articles/TiptapEditor')
  const root = createRoot(window.document.getElementById('root')!)
  const requests: { source: File | string; resolve: (value: { url: string; width: number; height: number }) => void; reject: (error: Error) => void; progress: (value: number) => void }[] = []
  globals.__articleUploadMock = (source: File | string, progress: (value: number) => void) => new Promise((resolve, reject) => { requests.push({ source, progress, resolve, reject }); progress(25) })
  let json: any = null
  let state = { pending: 0, failed: 0 }
  try {
    function ControlledEditor() {
      const [body, setBody] = useState<unknown>(null)
      return createElement(TiptapEditor, { content: body, onChange: next => { json = next; setBody(next) }, onUploadStateChange: next => { state = next } })
    }
    await act(async () => { root.render(createElement(ControlledEditor)); await new Promise(resolve => setTimeout(resolve, 20)) })
    const editable = window.document.querySelector('.tiptap') as HTMLElement
    assert.ok(editable)
    function paste(html: string, files: File[] = []) {
      const event = new window.Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', { value: { files, getData: (type: string) => type === 'text/html' ? html : '' } })
      editable.dispatchEvent(event)
      assert.equal(event.defaultPrevented, true)
    }
    async function finishUploads(start: number, count: number) {
      for (let index = start; index < start + count; index++) {
        assert.ok(requests[index], `upload ${index} started`)
        await act(async () => { requests[index].progress(100); requests[index].resolve({ url: `https://storage.example.test/article-images/${index}.webp`, width: 1200, height: 800 }); await Promise.resolve() })
      }
    }
    const foreignBlobFile = new window.File(['png'], 'clipboard.png', { type: 'image/png' }) as unknown as File
    for (let round = 0; round < 3; round++) {
      await act(async () => { paste(docs, round === 0 ? [foreignBlobFile] : []) })
      assert.equal(state.pending, 5, JSON.stringify({state, requests:requests.length,json}))
      await finishUploads(round * 5, 5)
      assert.deepEqual(state, { pending: 0, failed: 0 })
    }
    const allNodes = (doc: any): any[] => [doc, ...(doc.content || []).flatMap(allNodes)]
    assert.equal(requests[2].source, foreignBlobFile)
    assert.equal(allNodes(json).filter(node => node.type === 'image').length, 15)
    assert.equal(allNodes(json).filter(node => node.type === 'image' && node.attrs.src.startsWith('https://storage.example.test/')).length, 15)
    assert.doesNotMatch(JSON.stringify(json), /data:image|blob:|googleusercontent/)
    assert.ok(allNodes(json).some(node => node.type === 'table'))
    const screenshot = new window.File([new Uint8Array([1])], 'word-image.png', { type: 'image/png' }) as unknown as File
    await act(async () => { paste(word, [screenshot]) })
    assert.equal(state.pending, 2)
    assert.equal(requests[15].source, screenshot)
    await act(async () => { requests[15].reject(new Error('Temporary upload failure')); await Promise.resolve() })
    await finishUploads(16, 1)
    assert.equal(state.failed, 1)
    const retryButton = Array.from(window.document.querySelectorAll('button')).find(button => button.textContent === 'Qayta urinish / Retry')!
    assert.ok(retryButton)
    await act(async () => { retryButton.click() })
    await finishUploads(17, 1)
    assert.deepEqual(state, { pending: 0, failed: 0 })
    const dropped = [new window.File(['1'], 'one.png', { type: 'image/png' }), new window.File(['2'], 'two.png', { type: 'image/png' })]
    await act(async () => {
      const event = new window.MouseEvent('drop', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 })
      Object.defineProperty(event, 'dataTransfer', { value: { files: dropped, getData: () => '' } })
      // The simulated point is outside the document; the handler retains selection.
      Object.defineProperty(window.document, 'elementFromPoint', { configurable: true, value: () => null })
      editable.dispatchEvent(event)
      assert.equal(event.defaultPrevented, true)
    })
    await finishUploads(18, 2)
    assert.equal(allNodes(json).filter(node => node.type === 'image').length, 19)
    assert.equal(editable.getAttribute('lang'), 'uz')
    assert.equal(editable.getAttribute('spellcheck'), 'true')
  } finally {
    await act(async () => root.unmount())
    delete globals.__articleUploadMock
    delete globals.IS_REACT_ACT_ENVIRONMENT
    for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globals[name] }
    window.close()
  }
})
