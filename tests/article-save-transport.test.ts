import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import * as pasteHelpers from '../src/lib/article-editor-paste'

const require = createRequire(import.meta.url)

// Use the real application schema, including its image metadata, alignment,
// tables and marks. CSS/React node views are irrelevant to ProseMirror.toJSON().
const source = readFileSync(new URL('../src/app/admin/(dashboard)/articles/article-editor-extensions.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
const loaded = { exports: {} as { createArticleEditorExtensions: (handlers: unknown) => unknown[] } }
new Function('exports', 'module', 'require', compiled)(loaded.exports, loaded, (name: string) => name.endsWith('.css') ? {} : name === '@/lib/article-editor-paste' ? pasteHelpers : require(name))
const schema = require('@tiptap/core').getSchema(loaded.exports.createArticleEditorExtensions({ retry: () => {}, replace: () => {} }))
const flightClient = require('next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.production.js')
const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })

test('real ProseMirror images survive the production Server Action transport only after plain-JSON normalization', async () => {
  const document = schema.nodeFromJSON({ type: 'doc', content: [
    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: "O'zbekcha matn", marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://example.com/article', target: '_blank' } }] }] },
    { type: 'image', attrs: { src: 'https://storage.example.test/article-images/photo.webp', alt: 'Tajriba', caption: 'Rasm izohi', align: 'left', displayWidth: 55, width: 1200, height: 800 } },
    { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', attrs: { colspan: 2, colwidth: [140, 160] }, content: [paragraph('Natija')] }] }, { type: 'tableRow', content: [{ type: 'tableCell', content: [paragraph('Birinchi')] }, { type: 'tableCell', content: [paragraph('Ikkinchi')] }] }] },
  ] })
  // Editor.getJSON() directly calls this same ProseMirror Node.toJSON(). These
  // attrs objects are null-prototype objects, unlike handcrafted JSON fixtures.
  const body = document.toJSON()
  assert.equal(Object.getPrototypeOf(body.content[0].attrs), null)
  assert.equal(Object.getPrototypeOf(body.content[1].attrs), null)
  assert.equal(Object.getPrototypeOf(body.content[0].content[0].marks.find((mark: { type: string }) => mark.type === 'link').attrs), null)
  const payload = { slug: 'transport-regression', title_uz: 'Sinov', published: true, body_uz: body, body_en: null, body_ru: schema.nodeFromJSON({ type: 'doc', content: [paragraph('Русский текст')] }).toJSON() }
  const normalized = JSON.parse(JSON.stringify(payload))
  const rawWire = await flightClient.encodeReply([payload], { temporaryReferences: flightClient.createTemporaryReferenceSet() })
  const normalizedWire = await flightClient.encodeReply([normalized], { temporaryReferences: flightClient.createTemporaryReferenceSet() })
  assert.equal(typeof rawWire, 'string')
  assert.equal(typeof normalizedWire, 'string')
  assert.match(rawWire, /"attrs":"\$T"/, 'React turns unsupported null-prototype attributes into temporary client references')
  assert.doesNotMatch(normalizedWire, /"\$T"/)

  // React's server decoder must run with its react-server condition. This child
  // process only decodes the two in-memory requests and runs our real guards and
  // renderer: no HTTP, live auth, database, or storage is involved.
  const script = `
    import { readFileSync } from 'node:fs';
    import { createRequire } from 'node:module';
    import { hasUnfinishedArticleImages } from './src/lib/article-form.ts';
    import { articleBodyToHtml } from './src/lib/article-content.ts';
    const require = createRequire(import.meta.url);
    const server = require('next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-server.node.production.js');
    const wires = JSON.parse(readFileSync(0, 'utf8'));
    const decode = (wire) => server.decodeReply(wire, {}, { temporaryReferences: server.createTemporaryReferenceSet() });
    const raw = (await decode(wires.raw))[0];
    let rawError = null;
    try { hasUnfinishedArticleImages(raw.body_uz); } catch (error) { rawError = error.message; }
    const plain = (await decode(wires.normalized))[0];
    const result = { rawError, unfinished: ['uz', 'en', 'ru'].map(locale => hasUnfinishedArticleImages(plain['body_' + locale])), uz: articleBodyToHtml(plain.body_uz), en: articleBodyToHtml(plain.body_en), ru: articleBodyToHtml(plain.body_ru) };
    process.stdout.write(JSON.stringify(result));
  `
  const decoded = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', '--input-type=module', '--eval', script], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    input: JSON.stringify({ raw: rawWire, normalized: normalizedWire }), encoding: 'utf8', timeout: 20_000,
  })
  assert.equal(decoded.status, 0, decoded.stderr || decoded.error?.message || 'React transport decoder failed')
  const result = JSON.parse(decoded.stdout)
  assert.match(result.rawError, /Cannot access src on the server.*temporary client reference/)
  assert.deepEqual(result.unfinished, [false, false, false])
  assert.match(result.uz, /style="text-align:center"/)
  assert.match(result.uz, /href="https:\/\/example.com\/article" target="_blank" rel="noopener noreferrer"/)
  assert.match(result.uz, /data-align="left" style="width:55%"/)
  assert.match(result.uz, /src="https:\/\/storage.example.test\/article-images\/photo.webp" alt="Tajriba" width="1200" height="800"/)
  assert.match(result.uz, /<figcaption>Rasm izohi<\/figcaption>/)
  assert.match(result.uz, /<th colspan="2" rowspan="1" colwidth="140,160">/)
  assert.equal(result.en, '')
  assert.match(result.ru, /Русский текст/)
})
