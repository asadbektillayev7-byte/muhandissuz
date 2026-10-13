import test from 'node:test'
import assert from 'node:assert/strict'
import { articleBodyToHtml, articleBodyToEditorHtml, hasArticleBody, localizedArticle, safeArticleEmbedUrl } from '../src/lib/article-content'

const doc = { type:'doc', content:[
  { type:'heading', attrs:{ level:2 }, content:[{type:'text', text:"Muhandislik o'zgaradi", marks:[{type:'bold'}]}] },
  { type:'paragraph', attrs:{textAlign:'center'}, content:[{type:'text',text:'H2O',marks:[{type:'subscript'}]}] },
  { type:'image',attrs:{src:'https://example.com/photo.webp',alt:'Muhandis',caption:'Rasm izohi',width:1600,height:900,align:'left',displayWidth:75} },
  { type:'table', content:[{type:'tableRow',content:[{type:'tableHeader',content:[{type:'paragraph',content:[{type:'text',text:'Sarlavha'}]}]},{type:'tableCell',attrs:{colspan:2},content:[{type:'paragraph',content:[{type:'text',text:'Qiymat'}]}]}]}] },
  { type:'videoEmbed',attrs:{src:'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',title:'Video'} },
] }

test('current TipTap documents render structure, images, captions and safe embeds', () => {
  const html=articleBodyToHtml(doc)
  for (const expected of ['<h2>', "o'zgaradi", '<sub>H2O</sub>', 'text-align:center', '<figure', 'data-align="left"', 'width:75%', '<figcaption>Rasm izohi</figcaption>', 'loading="lazy"', 'width="1600"', '<table>', 'colspan="2"', 'youtube-nocookie.com/embed/dQw4w9WgXcQ']) assert.ok(html.includes(expected), expected)
})

test('legacy array, children/Lexical, HTML and serialized document forms keep content', () => {
  assert.match(articleBodyToHtml([{type:'paragraph',children:[{type:'text',text:'Old array'}]}]), /<p>Old array<\/p>/)
  assert.match(articleBodyToHtml({root:{type:'root',children:[{type:'paragraph',children:[{type:'text',text:'Old Lexical',format:1}]}]}}), /<strong>Old Lexical<\/strong>/)
  assert.match(articleBodyToHtml('<p>Existing <strong>HTML</strong></p>'), /<strong>HTML<\/strong>/)
  assert.match(articleBodyToHtml(JSON.stringify(doc)), /Rasm izohi/)
  assert.match(articleBodyToHtml('Plain article\nSecond line'), /Plain article<br \/>Second line/)
})

test('sanitizer blocks scripts, events, base64, blob images, unsafe links and non-whitelisted iframes', () => {
  const html=articleBodyToHtml('<p onclick="evil()" style="color:red;font-family:evil">Safe<script>alert(1)</script><a href="javascript:evil()">link</a></p><img src="data:image/png;base64,YQ=="><img src="blob:https://example.com/id"><iframe src="https://youtube-nocookie.com.evil.com/embed/dQw4w9WgXcQ"></iframe><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?onload=x" onload="evil()"></iframe>')
  for (const forbidden of ['onclick','alert(', 'javascript:', 'data:', 'blob:', 'evil.com', 'onload', 'color:red', 'font-family']) assert.ok(!html.includes(forbidden), forbidden)
  assert.match(html, /https:\/\/www.youtube-nocookie.com\/embed\/dQw4w9WgXcQ/)
})

test('legacy transient images survive only the editor import path', () => {
  const html='<p>Text</p><img src="data:image/png;base64,YQ=="><img src="blob:https://example.com/id">'
  assert.match(articleBodyToEditorHtml(html), /data:image\/png/)
  assert.match(articleBodyToEditorHtml(html), /blob:https/)
  assert.ok(!articleBodyToHtml(html).includes('<img'))
})

test('missing optional translation falls back to Uzbek and does not require body for old records', () => {
  const row={title_uz:'Asl maqola',body_uz:doc,title_en:'Partial title',body_en:{type:'doc',content:[{type:'paragraph'}]}}
  const en=localizedArticle(row,'en')
  assert.equal(en.title,'Asl maqola');assert.equal(en.contentLocale,'uz');assert.equal(en.isFallback,true)
  assert.equal(localizedArticle(row,'ru').isFallback,true)
  assert.equal(localizedArticle({title_uz:'Old empty article'},'uz').title,'Old empty article')
  assert.equal(hasArticleBody({type:'doc',content:[{type:'paragraph'}]}),false)
  assert.equal(hasArticleBody('<p>&nbsp;</p>'),false)
  assert.equal(hasArticleBody(doc),true)
})

test('malformed legacy node content is ignored without crashing', () => {
  assert.doesNotThrow(() => articleBodyToHtml({type:'doc',content:[null,2,{type:'paragraph',content:'bad'},{type:'image',attrs:{src:123}}]}))
  assert.equal(safeArticleEmbedUrl('https://t.me/example/23?embed=1'),'https://t.me/example/23?embed=1')
  assert.equal(safeArticleEmbedUrl('https://drive.google.com/file/d/ABCDEFGHIJKL/preview'),'https://drive.google.com/file/d/ABCDEFGHIJKL/preview')
  assert.equal(safeArticleEmbedUrl('javascript:alert(1)'),null)
  assert.equal(safeArticleEmbedUrl('https://www.youtube-nocookie.com@evil.com/embed/dQw4w9WgXcQ'),null)
})

test('quiz text extraction also reads newly saved HTML and old article bodies', async () => {
  const { richTextToPlain } = await import('../src/lib/quizGeneration')
  assert.equal(richTextToPlain('<p>O\'zbek <strong>muhandislar</strong></p><p>A &amp; B</p>'), "O'zbek muhandislar\nA & B")
  assert.match(richTextToPlain(doc), /Muhandislik/)
  assert.match(richTextToPlain({ root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Legacy text' }] }] } }), /Legacy text/)
})
