import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { JSDOM } from 'jsdom'
import { articleBodyToHtml, articleBodyToEditorHtml } from '../src/lib/article-content'
import * as pasteHelpers from '../src/lib/article-editor-paste'

// Load the actual editor schema in memory. CSS and React node views do not need
// a browser to exercise ProseMirror's HTML parser; no network/server is used.
const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/app/admin/(dashboard)/articles/article-editor-extensions.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX, esModuleInterop:true } }).outputText
const loaded = { exports:{} as { createArticleEditorExtensions:(handlers:unknown) => unknown[] } }
new Function('exports', 'module', 'require', compiled)(loaded.exports, loaded, (name:string) => name.endsWith('.css') ? {} : name === '@/lib/article-editor-paste' ? pasteHelpers : require(name))
const schema = require('@tiptap/core').getSchema(loaded.exports.createArticleEditorExtensions({retry:()=>{},replace:()=>{}}))
function reopen(body:unknown) {
  const document = new JSDOM(`<main>${articleBodyToEditorHtml(articleBodyToHtml(body))}</main>`).window.document
  return require('@tiptap/pm/model').DOMParser.fromSchema(schema).parse(document.querySelector('main')).toJSON()
}
const paragraph = (text:string) => ({type:'paragraph',content:[{type:'text',text}]})

test('saved HTML reopens with every editor node and formatting intact', () => {
  const doc={type:'doc',content:[
    {type:'heading',attrs:{level:4,textAlign:'right'},content:[{type:'text',text:'Heading'}]},
    {type:'paragraph',attrs:{textAlign:'center'},content:[{type:'text',text:'All marks',marks:[{type:'bold'},{type:'italic'},{type:'underline'},{type:'strike'},{type:'superscript'},{type:'link',attrs:{href:'https://example.com',target:'_blank'}}]}]},
    {type:'paragraph',content:[{type:'text',text:'Water',marks:[{type:'subscript'}]},{type:'text',text:' code',marks:[{type:'code'}]},{type:'hardBreak'}]},
    {type:'bulletList',content:[{type:'listItem',content:[paragraph('Bullet')]}]},
    {type:'orderedList',attrs:{start:3},content:[{type:'listItem',content:[paragraph('Third')]}]},
    {type:'blockquote',content:[paragraph('Quote')]},
    {type:'pullQuote',content:[paragraph('Pull quote')]},
    {type:'codeBlock',content:[{type:'text',text:'const a = 1;\nconst b = 2;'}]},
    {type:'horizontalRule'},
    {type:'image',attrs:{src:'https://example.com/image.webp',alt:'Descriptive alt',caption:'Caption survives',align:'left',displayWidth:55,width:800,height:1200}},
    {type:'videoEmbed',attrs:{src:'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',provider:'youtube',title:'YouTube demo'}},
    {type:'videoEmbed',attrs:{src:'https://drive.google.com/file/d/ABCDEFGHIJKL/preview',provider:'drive',title:'Drive demo'}},
    {type:'videoEmbed',attrs:{src:'https://t.me/example/123?embed=1',provider:'telegram',title:'Telegram demo'}},
    {type:'table',content:[{type:'tableRow',content:[{type:'tableHeader',attrs:{colspan:2,rowspan:1,colwidth:[140,160]},content:[paragraph('Header')]}]},{type:'tableRow',content:[{type:'tableCell',content:[paragraph('Cell A')]},{type:'tableCell',content:[paragraph('Cell B')]}]}]},
  ]}
  const parsed=reopen(doc)
  assert.deepEqual(parsed.content.map((node:any)=>node.type),doc.content.map(node=>node.type))
  assert.equal(parsed.content[0].attrs.level,4)
  assert.equal(parsed.content[0].attrs.textAlign,'right')
  assert.equal(parsed.content[1].attrs.textAlign,'center')
  assert.deepEqual(new Set(parsed.content[1].content[0].marks.map((mark:any)=>mark.type)),new Set(['bold','italic','underline','strike','superscript','link']))
  assert.equal(parsed.content[4].attrs.start,3)
  assert.equal(parsed.content[7].content[0].text,'const a = 1;\nconst b = 2;')
  const image=parsed.content.find((node:any)=>node.type==='image').attrs
  for(const key of ['src','alt','caption','align','displayWidth','width','height'] as const) assert.equal(image[key],doc.content[9].attrs?.[key as keyof typeof doc.content[9]['attrs']],key)
  assert.deepEqual(parsed.content.filter((node:any)=>node.type==='videoEmbed').map((node:any)=>node.attrs.provider),['youtube','drive','telegram'])
  assert.equal(parsed.content.at(-1).content[0].content[0].attrs.colspan,2)
  assert.deepEqual(parsed.content.at(-1).content[0].content[0].attrs.colwidth,[140,160])
  assert.equal(parsed.content[10].attrs.title,'YouTube demo')
})

test('reopened legacy HTML retains image caption and all text without active content', () => {
  const parsed=reopen('<h2>Old article</h2><p>Before<img src="https://example.com/a.webp" alt="A" onerror="alert(1)">After</p><figure data-align="center" style="width:75%"><img src="https://example.com/b.webp" alt="B" width="600" height="400"><figcaption>Original caption</figcaption></figure><script>evil()</script>')
  const html=articleBodyToHtml(parsed)
  for(const value of ['Old article','Before','After','Original caption','width:75%']) assert.ok(html.includes(value),value)
  for(const value of ['onerror','alert(1)','evil()']) assert.ok(!html.includes(value),value)
})
