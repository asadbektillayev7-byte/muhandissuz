import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { prepareArticlePaste, pairArticlePasteImages, normalizeArticleLink, parseArticleEmbed, articleImageUploadState } from '../src/lib/article-editor-paste'

const docs = readFileSync(new URL('./fixtures/articles/google-docs.html', import.meta.url), 'utf8')
const word = readFileSync(new URL('./fixtures/articles/word.html', import.meta.url), 'utf8')

test('Google Docs paste retains all five images as ordered upload jobs, removes transient URLs and presentation junk', () => {
  const pasted = prepareArticlePaste(docs, (() => { let i = 0; return () => `image-${++i}` })())
  const dom = new JSDOM(pasted.html).window.document
  assert.equal(pasted.images.length, 5)
  assert.equal(dom.querySelectorAll('img[data-upload-id]').length, 5)
  assert.deepEqual(pasted.images.map(image => image.id), ['image-1', 'image-2', 'image-3', 'image-4', 'image-5'])
  assert.equal(pasted.images[0].width, 1800)
  assert.match(pasted.images[1].source, /^data:/)
  assert.match(pasted.images[2].source, /^blob:/)
  assert.equal(dom.querySelectorAll('[style],[class],[id],script,meta').length, 0)
  assert.equal(dom.querySelectorAll('h2,table,ul').length, 3)
  assert.ok(dom.querySelector('a[href="https://muhandiss.uz/uz"]'))
  assert.equal(dom.querySelector('strong')?.textContent, 'Qalin matn')
  assert.equal(dom.querySelector('h2')?.parentElement?.tagName, 'BODY')
  assert.doesNotMatch(pasted.html, /data:image|blob:|googleusercontent/)
})

test('Word paste cleans Mso styling and preserves structure plus file and VML images', () => {
  const pasted = prepareArticlePaste(word)
  const dom = new JSDOM(pasted.html).window.document
  assert.equal(pasted.images.length, 2)
  assert.match(pasted.images[0].source, /^file:/)
  assert.match(pasted.images[1].source, /^data:/)
  assert.ok(dom.querySelector('strong'))
  assert.ok(dom.querySelector('em'))
  assert.ok(dom.querySelector('u'))
  assert.ok(dom.querySelector('s'))
  assert.ok(dom.querySelector('th[colspan="2"]'))
  assert.ok(dom.querySelector('blockquote'))
  assert.equal(dom.querySelectorAll('img').length, 2)
  assert.doesNotMatch(pasted.html, /Mso|Calibri|script|window.bad|style=/)
})

test('The same document pasted three times creates fresh image jobs for every image', () => {
  const batches = Array.from({ length: 3 }, () => prepareArticlePaste(docs))
  assert.deepEqual(batches.map(batch => batch.images.length), [5, 5, 5])
  assert.equal(new Set(batches.flatMap(batch => batch.images.map(image => image.id))).size, 15)
})

test('Unsupported image sources remain explicit failed import candidates, never silently disappear', () => {
  const pasted = prepareArticlePaste('<p>Before<img src="javascript:alert(1)"><img>After</p>')
  assert.equal(pasted.images.length, 2)
  assert.equal(new JSDOM(pasted.html).window.document.querySelectorAll('img').length, 2)
  assert.doesNotMatch(pasted.html, /javascript:/)
  assert.deepEqual(articleImageUploadState({ type: 'doc', content: [{ type: 'image', attrs: { uploadState: 'pending' } }, { type: 'image', attrs: { uploadState: 'error' } }, { type: 'image', attrs: { uploadId: 'recovered', src: '' } }, { type: 'image', attrs: { src: 'https://storage.example.test/a.webp' } }] }), { pending: 1, failed: 2 })
})

test('Links and embeds reject unsafe URLs and normalize allowed providers', () => {
  assert.equal(normalizeArticleLink('javascript:alert(1)'), null)
  assert.equal(normalizeArticleLink('data:text/html,x'), null)
  assert.equal(normalizeArticleLink('https://name:password@site.test/'), null)
  assert.equal(normalizeArticleLink('https://muhandiss.uz/uz'), 'https://muhandiss.uz/uz')
  assert.equal(normalizeArticleLink('mailto:editor@example.test'), 'mailto:editor@example.test')
  assert.equal(parseArticleEmbed('https://youtu.be/dQw4w9WgXcQ')?.src, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  assert.equal(parseArticleEmbed('https://drive.google.com/file/d/1abcdEFghijkLMNOP/view')?.src, 'https://drive.google.com/file/d/1abcdEFghijkLMNOP/preview')
  assert.equal(parseArticleEmbed('https://t.me/muhandiss/25')?.src, 'https://t.me/muhandiss/25?embed=1')
  assert.equal(parseArticleEmbed('https://t.me/muhandiss/25?embed=1')?.provider, 'telegram')
  assert.equal(parseArticleEmbed('https://t.me.evil.test/muhandiss/25'), null)
  assert.equal(parseArticleEmbed('https://example.test/iframe'), null)
})


test('Mixed CSS text marks survive while neutral Google Docs bold wrappers do not', () => {
  const pasted = prepareArticlePaste('<b style="font-weight:normal"><p>Plain <span style="font-family:Arial;color:red;font-weight:700;font-style:italic;text-decoration:underline line-through">Marked</span> plain</p></b>')
  const document = new JSDOM(pasted.html).window.document
  assert.equal(document.querySelector('p')?.firstChild?.textContent, 'Plain ')
  assert.equal(document.querySelector('strong em u s')?.textContent, 'Marked')
  assert.doesNotMatch(pasted.html, /style|font|color/)
})


test('Clipboard File items recover foreign blob URLs without duplicate images; unmatched files are retained', () => {
  const images = prepareArticlePaste(docs).images
  const screenshot = new File(['png'], 'clipboard.png', { type: 'image/png' })
  const paired = pairArticlePasteImages(images, [screenshot])
  assert.equal(paired.jobs[2].source, screenshot)
  assert.equal(paired.jobs[0].source, images[0].source)
  assert.equal(paired.remainingFiles.length, 0)
  const extra = new File(['png2'], 'extra.png', { type: 'image/png' })
  const more = pairArticlePasteImages([{ id: 'one', source: 'https://example.test/clipboard.png', alt: '' }], [screenshot, extra])
  assert.equal(more.jobs[0].source, screenshot)
  assert.deepEqual(more.remainingFiles, [extra])
  const same = pairArticlePasteImages([{ id: 'one', source: 'data:image/png;base64,cG5n', alt: '' }], [screenshot])
  assert.equal(same.jobs[0].source, screenshot)
  assert.equal(same.remainingFiles.length, 0)
})
