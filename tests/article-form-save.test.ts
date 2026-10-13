import assert from 'node:assert/strict'
import test from 'node:test'
import { register } from 'node:module'
import { JSDOM } from 'jsdom'
import { Schema } from '@tiptap/pm/model'

// Mount the real parent form. Replace only the rich editor, uploads, navigation
// wrapper and server transport; this test never contacts Supabase or writes data.
register(`data:text/javascript,${encodeURIComponent(`
export async function load(url, context, nextLoad) {
  if (url.endsWith('/src/lib/actions.ts')) return { format: 'module', shortCircuit: true, source: 'export const adminSaveArticle = (...args) => globalThis.__articleSaveMock(...args); export const adminCheckSlug = async () => false;' };
  if (url.endsWith('/TiptapEditor.tsx')) return { format: 'module', shortCircuit: true, source: 'import {createElement} from "react"; export function TiptapEditor({content,onChange,language}) { return createElement("div", {}, createElement("output", {"data-testid":"editor-value"}, typeof content === "string" ? content : JSON.stringify(content)), createElement("button", {type:"button", "data-testid":"paste-document", onClick:() => onChange(globalThis.__articleDocumentMock[language])}, "Test paste document"), createElement("button", {type:"button", "data-testid":"edit-body", onClick:() => onChange("<p>Newer text typed while saving.</p>")}, "Test edit body")); }' };
  if (url.endsWith('/ImageUploadField.tsx')) return { format: 'module', shortCircuit: true, source: 'export const ImageUploadField = () => null;' };
  if (url.endsWith('/next/link.js')) return { format: 'module', shortCircuit: true, source: 'import {createElement} from "react"; export default function Link(props) { return createElement("a",props); }' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

test('new article save normalizes real ProseMirror attributes across languages and preserves failure/retry recovery', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    pretendToBeVisual: true, url: 'https://editor.example.test/admin/articles/new',
  })
  const window = dom.window
  const globals = globalThis as unknown as Record<string, unknown>
  const descriptors = new Map<string, PropertyDescriptor | undefined>()
  for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Node', 'Element', 'Event', 'MouseEvent', 'localStorage', 'location']) {
    descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === 'window' ? window : (window as unknown as Record<string, unknown>)[name] })
  }
  const oldAct = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  // Real ProseMirror Node.toJSON() retains null-prototype attrs objects. Feeding
  // this output through the mounted form catches the actual Server Action
  // argument boundary, including an inactive optional language's document.
  const schema = new Schema({ nodes: {
    doc: { content: 'block+' }, paragraph: { group: 'block', content: 'inline*' }, text: { group: 'inline' },
    image: { group: 'block', atom: true, attrs: {
      src: { default: '' }, alt: { default: '' }, caption: { default: '' },
      width: { default: null }, height: { default: null }, align: { default: 'center' }, displayWidth: { default: 100 },
      uploadId: { default: null }, uploadState: { default: null },
    } },
  } })
  const documents = Object.fromEntries(['uz', 'en'].map(language => [language, schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text(`Motosport — ${language.toUpperCase()} article text.`)]),
    schema.node('image', {
      src: `https://storage.example.test/article-images/motosport-${language}.webp`,
      alt: `Motosport ${language.toUpperCase()}`, caption: `Haydovchining ko'rsatkichlari — ${language.toUpperCase()}`,
      width: 1280, height: 720, align: 'center', displayWidth: 75,
    }),
  ]).toJSON()]))
  for (const document of Object.values(documents)) assert.equal(Object.getPrototypeOf(document.content[1].attrs), null, 'fixture must reproduce real ProseMirror attributes')
  globals.__articleDocumentMock = documents
  const draftKey = 'muhandiss:article-draft:new'
  const draft = {
    version: 1, at: new Date().toISOString(),
    form: {
      title_uz: 'Motosport muhandisligi', slug: 'motosport-muhandisligi',
      body_uz: '<p>Original article text and images are preserved.</p>',
      published_date: '2026-10-13T09:30', status: 'draft',
    },
  }
  window.localStorage.setItem(draftKey, JSON.stringify(draft))
  const requests: {
    data: Record<string, unknown>; id: unknown;
    resolve: (value: unknown) => void; reject: (error: Error) => void;
  }[] = []
  globals.__articleSaveMock = (data: Record<string, unknown>, id: unknown) => new Promise((resolve, reject) => requests.push({ data, id, resolve, reject }))

  const { createElement, act } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { ArticleForm } = await import('../src/app/admin/(dashboard)/articles/ArticleForm')
  const root = createRoot(window.document.getElementById('root')!)
  const button = (label: string) => Array.from(window.document.querySelectorAll('button')).find(item => item.textContent === label)!
  const siteLink = () => Array.from(window.document.querySelectorAll('a')).find(item => item.textContent?.includes('View on site'))
  const assertPlainDocuments = (data: Record<string, unknown>) => {
    for (const language of ['uz', 'en']) {
      const document = data[`body_${language}`] as { content: { attrs?: Record<string, unknown> }[] }
      assert.equal(Object.getPrototypeOf(document.content[1].attrs), Object.prototype, `${language} image attrs must be plain before adminSaveArticle`)
      assert.equal(JSON.stringify(document), JSON.stringify(documents[language]), `${language} image URL, caption, alt text, dimensions and text must survive normalization`)
      assert.notEqual(document.content[1].attrs, documents[language].content[1].attrs)
    }
  }
  try {
    await act(async () => { root.render(createElement(ArticleForm, { categories: [], authors: [] })) })
    assert.ok(button('Tiklash / Restore'), 'existing recovery is offered')
    await act(async () => { button('Tiklash / Restore').click() })
    assert.match(window.document.body.textContent || '', /Original article text/)
    assert.equal(siteLink(), undefined)
    await act(async () => { (window.document.querySelector('[data-testid="paste-document"]') as HTMLButtonElement).click() })
    await act(async () => { button('EN · Ixtiyoriy').click() })
    await act(async () => { (window.document.querySelector('[data-testid="paste-document"]') as HTMLButtonElement).click() })
    await act(async () => { button('UZ · Asosiy').click() })

    await act(async () => { button('Saqlash / Save').click() })
    assert.equal(requests.length, 1)
    assert.equal(requests[0].id, undefined)
    assertPlainDocuments(requests[0].data)
    assert.equal(button('Saqlanmoqda / Saving…').disabled, true)
    assert.equal(window.location.pathname, '/admin/articles/new')
    assert.equal(siteLink(), undefined)

    const safeMessage = 'Maqola saqlanmadi. Qayta urinib ko‘ring / Article could not be saved. Please retry.'
    await act(async () => { requests[0].resolve({ ok: false, error: { code: 'SAVE_FAILED', message: safeMessage, reference: 'article-test-reference' } }) })
    const error = window.document.querySelector('[role="alert"]')
    assert.ok(error?.textContent?.includes(safeMessage), 'the expected action message survives transport')
    assert.ok(error?.textContent?.includes('article-test-reference'))
    assert.doesNotMatch(error?.textContent || '', /Server Components render|specific message is omitted/)
    assert.equal(window.location.pathname, '/admin/articles/new', 'a failed create must not acquire an ID')
    assert.equal(siteLink(), undefined)
    assert.ok(!window.document.body.textContent?.includes('Saqlandi / Saved ·'))
    const recovered = JSON.parse(window.localStorage.getItem(draftKey)!)
    for (const language of ['uz', 'en']) assert.equal(JSON.stringify(recovered.form[`body_${language}`]), JSON.stringify(documents[language]))
    assert.equal(recovered.form.title_uz, draft.form.title_uz)
    assert.equal(button('Saqlash / Save').disabled, false)

    await act(async () => { button('Saqlash / Save').click() })
    assert.equal(requests.length, 2)
    assert.equal(requests[1].id, undefined, 'retry still creates the unsaved article')
    assert.equal(requests[1].data.slug, draft.form.slug)
    assertPlainDocuments(requests[1].data)
    assert.equal(requests[1].data.title_en, '', 'optional English title does not block saving')
    await act(async () => { requests[1].resolve({ ok: true, article: { id: 97, slug: draft.form.slug, published: false, published_date: '2026-10-13T04:30:00.000Z' } }) })
    assert.equal(window.location.pathname, '/admin/articles/97')
    assert.equal(siteLink()?.getAttribute('href'), '/uz/articles/motosport-muhandisligi')
    assert.equal(window.document.querySelector('[role="alert"]'), null)
    assert.match(window.document.body.textContent || '', /Saqlandi \/ Saved ·/)
    assert.equal(window.localStorage.getItem(draftKey), null)

    // A framework/network failure may reject before any structured response.
    // It must keep the last successful ID/link and recover the newest edits.
    await act(async () => { (window.document.querySelector('[data-testid="edit-body"]') as HTMLButtonElement).click() })
    await act(async () => { button('Saqlash / Save').click() })
    assert.equal(requests.length, 3)
    assert.equal(requests[2].id, 97)
    await act(async () => { requests[2].reject(new Error('An error occurred in the Server Components render. The specific message is omitted in production builds.')) })
    assert.match(window.document.querySelector('[role="alert"]')?.textContent || '', /Could not complete the save request/)
    assert.doesNotMatch(window.document.querySelector('[role="alert"]')?.textContent || '', /Server Components render/)
    assert.equal(window.location.pathname, '/admin/articles/97')
    assert.equal(siteLink()?.getAttribute('href'), '/uz/articles/motosport-muhandisligi')
    assert.equal(JSON.parse(window.localStorage.getItem('muhandiss:article-draft:97')!).form.body_uz, '<p>Newer text typed while saving.</p>')
  } finally {
    await act(async () => { root.unmount() })
    delete globals.__articleSaveMock
    delete globals.__articleDocumentMock
    if (oldAct === undefined) delete globals.IS_REACT_ACT_ENVIRONMENT
    else globals.IS_REACT_ACT_ENVIRONMENT = oldAct
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else Reflect.deleteProperty(globalThis, name)
    }
    window.close()
  }
})
