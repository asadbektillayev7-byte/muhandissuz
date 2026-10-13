import test from 'node:test'
import assert from 'node:assert/strict'
import { articleSlug, isArticleSlug, toTashkentInput, fromTashkentInput, articleStatus, hasUnfinishedArticleImages } from '../src/lib/article-form'

test('slugs handle Uzbek apostrophes and Cyrillic without changing displayed content', () => {
  assert.equal(articleSlug("O‘zbekiston G'oyasi — Янги Мақола!"), 'ozbekiston-goyasi-yangi-maqola')
  for (const bad of ['', 'hello world', 'A-name', '-one', 'one--two', "o'zbek", 'русский']) assert.equal(isArticleSlug(bad), false)
  assert.equal(isArticleSlug('nega-motosport-muhandisligi-muhim'), true)
})

test('schedule uses explicit Tashkent timezone and exact publication boundary', () => {
  assert.equal(fromTashkentInput('2026-10-13T09:30'), '2026-10-13T04:30:00.000Z')
  assert.equal(toTashkentInput('2026-10-13T04:30:00Z'), '2026-10-13T09:30')
  assert.throws(() => fromTashkentInput('2026-02-30T10:00'))
  const at = Date.parse('2026-10-13T04:30:00Z')
  assert.equal(articleStatus({ published: true, published_date: '2026-10-13T04:30:00Z' }, at - 1), 'scheduled')
  assert.equal(articleStatus({ published: true, published_date: '2026-10-13T04:30:00Z' }, at), 'published')
  assert.equal(articleStatus({ published: false }, at), 'draft')
})

test('unfinished images cannot be saved even in an inactive language or legacy HTML', () => {
  assert.equal(hasUnfinishedArticleImages({ type: 'doc', content: [{ type: 'image', attrs: { src: 'blob:local' } }] }), true)
  assert.equal(hasUnfinishedArticleImages('<p>hello<img src="data:image/png;base64,abc"></p>'), true)
  assert.equal(hasUnfinishedArticleImages({ type: 'doc', content: [{ type: 'imageUpload', attrs: { id: 'failed' } }] }), true)
  assert.equal(hasUnfinishedArticleImages({ type: 'doc', content: [{ type: 'text', text: 'data: URLs are explained here' }] }), false)
  assert.equal(hasUnfinishedArticleImages('<img src="https://example.supabase.co/storage/v1/object/public/article-images/a.webp">'), false)
})

test('unfinished-image guard covers HTML wrappers, entities, controls and deeply nested documents', () => {
  for (const body of [
    { html: '<p>Caption</p><img src="data:image/png;base64,YQ==">' },
    '<p>Caption</p><img src="d&#97;ta:image/png;base64,YQ==">',
    '<img src="bl&#111;b:https://example.com/id">',
    '<img src="d&#9;ata:image/png;base64,YQ==">',
    '<span data-upload-id="lost-on-recovery"></span>',
    JSON.stringify({ html: '<img src="blob:https://example.com/id">' }),
    { type: 'upload', value: { url: 'data:image/png;base64,YQ==' } },
    { type: 'image', attrs: { src: 'javascript:alert(1)' } },
  ]) assert.equal(hasUnfinishedArticleImages(body), true, JSON.stringify(body))
  let nested: unknown = { type: 'text', text: 'Nested text' }
  for (let index = 0; index < 82; index++) nested = { content: [nested] }
  assert.equal(hasUnfinishedArticleImages(nested), true)
})

test('legacy uploaded images with persistent URLs remain savable without visiting every language', () => {
  const legacy = { root: { type: 'root', children: [{ type: 'upload', value: { url: 'https://example.com/old.webp' } }] } }
  assert.equal(hasUnfinishedArticleImages(legacy), false)
  assert.equal(hasUnfinishedArticleImages({ type: 'upload', value: { url: '/legacy-image.webp' } }), false)
  assert.equal(hasUnfinishedArticleImages({ html: '<p>A data: URL is explained here.</p><img src="https://example.com/old.webp">' }), false)
})
